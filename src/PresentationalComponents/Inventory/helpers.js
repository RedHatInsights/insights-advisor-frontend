import { mergeArraysByDiffKeys } from '../Common/Tables';
import { createOptions, createSortParam, getCsrfTokenHeader } from '../helper';
import LastSeenColumnHeader from '../../Utilities/LastSeenColumnHeader';
import { fitContent } from '@patternfly/react-table';
import { DateFormat } from '@redhat-cloud-services/frontend-components';
import React from 'react';
import Qs from 'qs';

/**
 * Fetches systems data based on the currently set filters.
 * For pathways: Fetches from SYSTEMS_FETCH_URL with pathway slug.
 * For rules: Fetches from RULES_FETCH_URL with rule ID.
 *
 * @param {Object} params Configuration object
 * @param {number} params.per_page Number of items per page
 * @param {number} params.page Current page number
 * @param {Object} params.advisorFilters Advisor-specific filters
 * @param {Object} params.filters General filters
 * @param {Array} params.workloads Workload filters
 * @param {Object} params.pathway Pathway object with slug property (optional)
 * @param {Object} params.rule Rule object with rule_id property (optional)
 * @param {Array} params.selectedTags Selected tag filters
 * @param {string} params.sort Sort parameter
 * @param {string} params.RULES_FETCH_URL Base URL for rules API
 * @param {string} params.SYSTEMS_FETCH_URL Base URL for systems API
 * @param {Object} params.axios Axios instance for making requests
 * @returns {Promise<Object>} API response with systems data
 */
export const paginatedRequestHelper = async ({
  per_page,
  page,
  advisorFilters,
  filters,
  workloads,
  pathway,
  rule,
  selectedTags,
  sort,
  RULES_FETCH_URL,
  SYSTEMS_FETCH_URL,
  axios,
}) => {
  let options = createOptions(
    advisorFilters,
    page,
    per_page,
    sort,
    pathway,
    filters,
    selectedTags,
    workloads,
  );

  return pathway
    ? await axios.get(`${SYSTEMS_FETCH_URL}`, {
        params: { ...options, pathway: pathway.slug },
        paramsSerializer: (params) =>
          Qs.stringify(params, { arrayFormat: 'repeat' }),
      })
    : await axios.get(
        `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/systems_detail/`,
        {
          params: options,
          paramsSerializer: (params) =>
            Qs.stringify(params, { arrayFormat: 'repeat' }),
        },
      );
};

/**
 * Factory function that creates an entity fetcher for the Inventory table.
 * Fetches systems from Advisor API, filters out systems not in Inventory (last_seen: null),
 * then enriches the data with Inventory API details.
 *
 * @param {Function} handleRefresh Callback to refresh the UI with new options
 * @param {Object} pathway Pathway object (optional)
 * @param {Function} setCurPageIds Callback to set current page system IDs
 * @param {Function} setTotal Callback to set total count
 * @param {Array<string>} selectedIds Array of selected system IDs
 * @param {Function} setFullFilters Callback to store full filter configuration
 * @param {Object} fullFilters Current full filter configuration
 * @param {Object} rule Rule object with rule_id (optional)
 * @param {string} RULES_FETCH_URL Base URL for rules API
 * @param {string} SYSTEMS_FETCH_URL Base URL for systems API
 * @param {Object} axios Axios instance for making requests
 * @returns {Function} Async function that fetches and processes entities
 */
export const getEntities =
  (
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIds,
    setFullFilters,
    fullFilters,
    rule,
    RULES_FETCH_URL,
    SYSTEMS_FETCH_URL,
    axios,
  ) =>
  async (_items, config, showTags, defaultGetEntities) => {
    const {
      per_page,
      page,
      orderBy,
      orderDirection,
      advisorFilters,
      filters,
      workloads,
      selectedTags,
    } = config;
    const sort = createSortParam(orderBy, orderDirection);

    let options = createOptions(
      advisorFilters,
      page,
      per_page,
      sort,
      pathway,
      filters,
      selectedTags,
      workloads,
    );
    handleRefresh(options);
    const allDetails = {
      ...config,
      pathway,
      handleRefresh,
      rule,
      sort,
      RULES_FETCH_URL,
      SYSTEMS_FETCH_URL,
      axios,
    };
    setFullFilters(allDetails);
    const fetchedSystems = await paginatedRequestHelper(allDetails);

    /**
     * Filter out systems that don't exist in Inventory.
     * Systems with last_seen: null exist in Advisor but not in Inventory,
     * which causes 404 errors when querying the Inventory API.
     */
    const systemsInInventory = fetchedSystems.data.filter(
      (system) => system.last_seen !== null,
    );

    /**
     * Adjust the total count to account for filtered systems.
     * The backend returns a count that includes systems with last_seen: null,
     * but we filter those out on the frontend to prevent 404 errors when
     * querying the Inventory API. We subtract the number of filtered systems
     * from this page to keep the count approximately accurate for pagination.
     */
    const filteredOutCount =
      fetchedSystems.data.length - systemsInInventory.length;

    let results = { results: [] };
    if (systemsInInventory.length > 0) {
      try {
        results = await defaultGetEntities(
          systemsInInventory.map((system) => system.system_uuid),
          {
            per_page,
            hasItems: true,
            fields: { system_profile: ['operating_system'] },
          },
          showTags,
        );
      } catch (inventoryError) {
        /**
         * Handle 404 errors gracefully in case systems are missing from Inventory.
         * This is a safety net - the filtering above should prevent most 404s.
         */
        if (inventoryError.response?.status === 404) {
          results = { results: [] };
        } else {
          throw inventoryError;
        }
      }
    }

    setCurPageIds(systemsInInventory.map((system) => system.system_uuid));
    setTotal(Math.max(0, fetchedSystems.meta.count - filteredOutCount));
    return Promise.resolve({
      results: mergeArraysByDiffKeys(systemsInInventory, results.results).map(
        (item) => {
          return {
            ...item,
            selected: selectedIds?.includes(item.id),
          };
        },
      ),
      total: Math.max(0, fetchedSystems.meta.count - filteredOutCount),
    });
  };

/**
 * Fetches data in batches across all pages.
 * Calculates the number of pages needed based on total and batchSize,
 * then makes parallel requests for all pages.
 *
 * @param {Function} fetchFunction Function to fetch a single page
 * @param {number} total Total number of items
 * @param {Object} filter Filter configuration
 * @param {number} batchSize Number of items per page (default: 100)
 * @param {Object} rule Rule object (optional)
 * @returns {Promise<Array>} Array of promises for all page requests
 */
const fetchBatched = (fetchFunction, total, filter, batchSize = 100, rule) => {
  const pages = Math.ceil(total / batchSize) || 1;
  return Promise.all(
    [...new Array(pages)].map((_, pageIdx) =>
      fetchFunction({
        ...filter,
        page: pageIdx + 1,
        per_page: batchSize,
        rule,
      }),
    ),
  );
};

/**
 * Factory function that creates a system ID fetcher for bulk operations.
 * Fetches all system IDs across all pages and returns them as a single array.
 * Sets loading state during the fetch operation.
 *
 * @param {Object} fullFilters Complete filter configuration
 * @param {number} total Total number of systems
 * @param {Object} rule Rule object
 * @param {Function} setIsLoading Callback to set loading state
 * @returns {Function} Async function that fetches all system IDs
 */
export const allCurrentSystemIds =
  (fullFilters, total, rule, setIsLoading) => async () => {
    setIsLoading(true);
    const results = await (
      await fetchBatched(paginatedRequestHelper, total, fullFilters, 100, rule)
    ).map((item) => item.data);

    const merged = [].concat.apply([], results).map((item) => item.system_uuid);
    setIsLoading(false);
    return merged;
  };

/**
 * Fetches remediation resolutions from an API for a specific rule and a list of selected systems.
 * It formats the API response into a new array of objects, where each object represents a selected
 * host and includes its name, ID, and the relevant resolutions.
 *
 * @param {object} entitites An object containing a `rows` property, which is an array of system objects. Each system object must have an `id` and `display_name`.
 * @param {object} rule An object representing the rule, containing a `rule_id` property. If rule or rule_id is missing, returns empty array.
 * @param {string[]} selectedIds An array of strings representing the IDs of the selected systems.
 * @returns {Promise<object[]>} A promise that resolves to an array of objects. Each object contains
 * `hostid`, `host_name`, `resolutions`, `rulename`, `description`, and `rebootable`. Returns an empty
 * array if rule_id is missing, the fetch fails, or if an error occurs.
 */
export const iopResolutionsMapper = async (entitites, rule, selectedIds) => {
  if (!rule?.rule_id) {
    console.error('Rule ID is missing, cannot fetch remediation resolutions');
    return [];
  }

  const formattedIssue = `advisor:${rule.rule_id}`;

  try {
    const response = await fetch(
      '/insights_cloud/api/remediations/v1/resolutions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          ...getCsrfTokenHeader(),
        },
        body: JSON.stringify({ issues: [formattedIssue] }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }

    const data = await response.json();
    const resolutions = data[formattedIssue]?.resolutions || [];

    const resolutionData = selectedIds.map((id) => {
      const matchingEntity = entitites?.rows?.find(
        (entity) => entity.id === id,
      );
      const hostName = matchingEntity ? matchingEntity.display_name : id;

      return {
        hostid: id,
        host_name: hostName,
        resolutions: resolutions,
        rulename: rule.rule_id,
        description: rule.description,
        rebootable: rule.reboot_required,
      };
    });
    return resolutionData;
  } catch (err) {
    console.error('An error occurred during fetch:', err);
    return [];
  }
};

export const lastSeenColumn = {
  key: 'last_seen',
  title: <LastSeenColumnHeader />,
  sortKey: 'last_seen',
  transforms: [fitContent],
  props: { width: 10 },
  dataLabel: 'Last seen',
  renderFunc: (last_seen) => (
    <DateFormat date={last_seen} extraTitle={'Last Seen: '} />
  ),
};
export const impactedDateColumn = {
  key: 'impacted_date',
  title: 'First impacted',
  sortKey: 'impacted_date',
  transforms: [fitContent],
  props: { width: 15 },
  renderFunc: (impacted_date) => (
    <DateFormat date={impacted_date} extraTitle={'First impacted: '} />
  ),
};
