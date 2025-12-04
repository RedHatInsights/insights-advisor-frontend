import { Get } from '../../Utilities/Api';
import { mergeArraysByDiffKeys } from '../Common/Tables';
import { createOptions, createSortParam } from '../helper';
import LastSeenColumnHeader from '../../Utilities/LastSeenColumnHeader';
import { fitContent } from '@patternfly/react-table';
import { DateFormat } from '@redhat-cloud-services/frontend-components';
import React from 'react';

/*This functions purpose is to grab the currently set filters, and return all associated systems for it.*/
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
    ? (
        await Get(
          `${SYSTEMS_FETCH_URL}`,
          {},
          { ...options, pathway: pathway.slug },
        )
      )?.data
    : (
        await Get(
          `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/systems_detail/`,
          {},
          options,
        )
      )?.data;
};

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
    };
    setFullFilters(allDetails);
    const fetchedSystems = await paginatedRequestHelper(allDetails);
    const results = await defaultGetEntities(
      fetchedSystems.data.map((system) => system.system_uuid),
      {
        per_page,
        hasItems: true,
        fields: { system_profile: ['operating_system'] },
        axios,
      },
      showTags,
    );
    setCurPageIds(fetchedSystems.data.map((system) => system.system_uuid));
    setTotal(fetchedSystems.meta.count);
    return Promise.resolve({
      results: mergeArraysByDiffKeys(fetchedSystems.data, results.results).map(
        (item) => {
          return {
            ...item,
            selected: selectedIds?.includes(item.id),
          };
        },
      ),
      total: fetchedSystems.meta.count,
    });
  };

/*Takes in the current filters, and keeps sending get request until there are no pages left*/
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
/*Grabs all systemIds and maniupaltes the data into one large array of systems*/
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
 * @param {object} rule An object representing the rule, containing a `rule_id` property.
 * @param {string[]} selectedIds An array of strings representing the IDs of the selected systems.
 * @returns {Promise<object[]>} A promise that resolves to an array of objects. Each object contains
 * `hostid`, `host_name`, `resolutions`, `rulename`, and `description`. Returns an empty
 * array if the fetch fails or if an error occurs.
 */
export const iopResolutionsMapper = async (entitites, rule, selectedIds) => {
  const formattedIssue = `advisor:${rule.rule_id}`;

  try {
    const response = await fetch(
      '/insights_cloud/api/remediations/v1/resolutions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'X-CSRF-Token': document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content'),
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
