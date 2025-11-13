import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import * as AppConstants from '../../AppConstants';
import messages from '../../Messages';
import { ruleResolutionRisk, capitalize } from '../Common/Tables';
import React, { useState, useEffect } from 'react';
import { Content } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';
import { DeleteApi } from '../../Utilities/Api';
import { getImpactingFilterChips } from '../Filters/impactingFilter';
import { getDefaultImpactingFilter } from './helpers';

/**
 * Removes a filter parameter from the active filters
 * @param {string} param - The filter parameter to remove
 * @param {Object} filters - Current filter state
 * @param {Function} setFilters - Function to update filters
 * @param {Function} setSearchText - Function to update search text
 */
export const removeFilterParam = (
  param,
  filters,
  setFilters,
  setSearchText,
) => {
  const newFilters = { ...filters };
  if (param === 'text') {
    setSearchText('');
  }
  delete newFilters[param];
  setFilters(newFilters);
};

/**
 * Creates filter configuration items for the PrimaryToolbar
 * @param {Object} filters - Current filter state
 * @param {Function} setFilters - Function to update filters
 * @param {string} searchText - Current search text value
 * @param {Function} setSearchText - Function to update search text
 * @param {Function} toggleRulesDisabled - Function to toggle rule status filter
 * @param {Object} intl - React Intl instance for translations
 * @returns {Array} Array of filter configuration objects
 */
export const filterConfigItems = (
  filters,
  setFilters,
  searchText,
  setSearchText,
  toggleRulesDisabled,
  intl,
) => {
  const addFilterParam = (param, values) => {
    if (values.length > 0) {
      setFilters({ ...filters, [param]: values });
    } else {
      removeFilterParam(param, filters, setFilters, setSearchText);
    }
  };

  return [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      type: conditionalFilterType.text,
      filterValues: {
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.total_risk.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.total_risk.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.total_risk.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.total_risk.urlParam,
            values,
          ),
        value: filters.total_risk,
        items: AppConstants.FILTER_CATEGORIES.total_risk.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.res_risk.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.res_risk.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.res_risk.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.res_risk.urlParam,
            values,
          ),
        value: filters.res_risk,
        items: AppConstants.FILTER_CATEGORIES.res_risk.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.impact.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.impact.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.impact.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.impact.urlParam,
            values,
          ),
        value: filters.impact,
        items: AppConstants.FILTER_CATEGORIES.impact.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.likelihood.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.likelihood.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.likelihood.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.likelihood.urlParam,
            values,
          ),
        value: filters.likelihood,
        items: AppConstants.FILTER_CATEGORIES.likelihood.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.category.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.category.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.category.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.category.urlParam,
            values,
          ),
        value: filters.category,
        items: AppConstants.FILTER_CATEGORIES.category.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.incident.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.incident.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.incident.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.incident.urlParam,
            values,
          ),
        value: filters.incident,
        items: AppConstants.FILTER_CATEGORIES.incident.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.has_playbook.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.has_playbook.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.has_playbook.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.has_playbook.urlParam,
            values,
          ),
        value: filters.has_playbook,
        items: AppConstants.FILTER_CATEGORIES.has_playbook.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.reboot.title,
      type: conditionalFilterType.checkbox,
      id: AppConstants.FILTER_CATEGORIES.reboot.urlParam,
      value: `checkbox-${AppConstants.FILTER_CATEGORIES.reboot.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(
            AppConstants.FILTER_CATEGORIES.reboot.urlParam,
            values,
          ),
        value: filters.reboot,
        items: AppConstants.FILTER_CATEGORIES.reboot.values,
      },
    },
    {
      label: AppConstants.FILTER_CATEGORIES.rule_status.title,
      type: AppConstants.FILTER_CATEGORIES.rule_status.type,
      id: AppConstants.FILTER_CATEGORIES.rule_status.urlParam,
      value: `single_select-${AppConstants.FILTER_CATEGORIES.rule_status.urlParam}`,
      filterValues: {
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: AppConstants.FILTER_CATEGORIES.rule_status.values,
      },
    },
  ];
};

/**
 * Builds filter chip data for display in the active filters bar
 * @param {Object} filters - Current filter state
 * @param {string} searchText - Current search text value
 * @param {boolean} [hasEdgeDevice=false] - Whether edge devices are present in the account
 * @returns {Array} Array of filter chip objects with category, chips, and urlParam
 */
export const buildFilterChips = (
  filters,
  searchText,
  hasEdgeDevice = false,
) => {
  const impactingFilterChips = getImpactingFilterChips(hasEdgeDevice);
  const allCategories = {
    ...AppConstants.FILTER_CATEGORIES,
    ...impactingFilterChips,
  };

  const chips = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'rule_status') {
      const filterCategory = allCategories[key];
      if (filterCategory && Array.isArray(value)) {
        value.forEach((v) => {
          const item = filterCategory.values.find(
            (item) => String(item.value) === String(v),
          );
          if (item) {
            chips.push({
              category: capitalize(filterCategory.title),
              chips: [{ name: item.label || item.text, value: v }],
              urlParam: key,
            });
          }
        });
      }
    }
  });

  if (searchText) {
    chips.push({
      category: 'Name',
      chips: [{ name: searchText, value: searchText }],
      urlParam: 'text',
    });
  }

  return chips;
};

/**
 * Creates configuration for active filters display and management
 * @param {Object} filters - Current filter state
 * @param {Function} setFilters - Function to update filters
 * @param {string} searchText - Current search text value
 * @param {Function} setSearchText - Function to update search text
 * @param {Object} intl - React Intl instance for translations
 * @param {boolean} [hasEdgeDevice=false] - Whether edge devices are present in the account
 * @returns {Object} Active filters configuration object with delete handlers
 */
export const getActiveFiltersConfig = (
  filters,
  setFilters,
  searchText,
  setSearchText,
  intl,
  hasEdgeDevice = false,
) => ({
  deleteTitle: intl.formatMessage(messages.resetFilters),
  filters: buildFilterChips(filters, searchText, hasEdgeDevice),
  showDeleteButton: true,
  onDelete: (_event, itemsToRemove, isAll) => {
    if (isAll) {
      setSearchText('');
      setFilters({
        total_risk: undefined,
        res_risk: undefined,
        impact: undefined,
        likelihood: undefined,
        category: undefined,
        incident: undefined,
        has_playbook: undefined,
        reboot: undefined,
        rule_status: 'enabled',
        ...(hasEdgeDevice ? getDefaultImpactingFilter(hasEdgeDevice) : {}),
      });
    } else {
      itemsToRemove.forEach((item) => {
        if (item.urlParam === 'text') {
          setSearchText('');
        } else {
          const newFilters = { ...filters };

          // Special handling for edge device filters
          if (
            item.urlParam === 'update_method' &&
            newFilters?.update_method?.length === 1 &&
            Object.prototype.hasOwnProperty.call(newFilters, 'impacting')
          ) {
            delete newFilters.impacting;
          }

          if (Array.isArray(newFilters[item.urlParam])) {
            const filteredValues = newFilters[item.urlParam].filter(
              (value) => String(value) !== String(item.chips[0].value),
            );
            if (filteredValues.length > 0) {
              newFilters[item.urlParam] = filteredValues;
            } else {
              delete newFilters[item.urlParam];
            }
            setFilters(newFilters);
          } else {
            removeFilterParam(
              item.urlParam,
              newFilters,
              setFilters,
              setSearchText,
            );
          }
        }
      });
    }
  },
});

/**
 * Filters rules based on active filter criteria
 * @param {Array} rules - Array of recommendation rules
 * @param {Object} filters - Current filter state with criteria
 * @param {string} searchText - Search text to filter by rule name/description
 * @returns {Array} Filtered array of rules matching all criteria
 */
export const filterRules = (rules, filters, searchText) => {
  return rules.filter((rule) => {
    // Filter by rule status
    if (filters.rule_status && rule.rule_status !== filters.rule_status) {
      return false;
    }

    // Filter by search text
    if (
      searchText &&
      !rule.description.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    // Filter by total risk
    if (
      filters.total_risk &&
      !filters.total_risk.includes(String(rule.total_risk))
    ) {
      return false;
    }

    // Filter by resolution risk
    if (
      filters.res_risk &&
      !filters.res_risk.includes(String(ruleResolutionRisk(rule)))
    ) {
      return false;
    }

    // Filter by impact
    if (
      filters.impact &&
      !filters.impact.includes(String(rule.impact.impact))
    ) {
      return false;
    }

    // Filter by likelihood
    if (
      filters.likelihood &&
      !filters.likelihood.includes(String(rule.likelihood))
    ) {
      return false;
    }

    // Filter by category
    if (
      filters.category &&
      !filters.category.includes(String(rule.category.id))
    ) {
      return false;
    }

    // Filter by incident
    if (filters.incident) {
      const isIncident = rule.tags && rule.tags.includes('incident');
      const filterValue = filters.incident.includes('true');
      if (isIncident !== filterValue) {
        return false;
      }
    }

    // Filter by has_playbook
    if (filters.has_playbook) {
      const hasPlaybook = rule.playbook_count > 0;
      const filterValue = filters.has_playbook.includes('true');
      if (hasPlaybook !== filterValue) {
        return false;
      }
    }

    // Filter by reboot
    if (filters.reboot) {
      const requiresReboot = rule.reboot_required;
      const filterValue = filters.reboot.includes('true');
      if (requiresReboot !== filterValue) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Creates message mapping for empty state scenarios
 * @param {Object} intl - React Intl instance for translations
 * @returns {Object} Object with message configs for different empty states (enabled, disabled, rhdisabled, default)
 */
export const messageMapping = (intl) => {
  const title = intl.formatMessage(messages.rulesTableNoRuleHitsTitle);

  return {
    enabled: {
      title,
      body: (
        <>
          <Content component="p">
            {intl.formatMessage(messages.rulesTableNoRuleHitsEnabledRulesBody)}
          </Content>
          <Content component="p">
            {intl.formatMessage(
              messages.rulesTableNoRuleHitsEnabledRulesBodySecondLine,
            )}
          </Content>
        </>
      ),
    },
    disabled: {
      title,
      body: (
        <>
          <Content component="p">
            {intl.formatMessage(messages.rulesTableNoRuleHitsDisabledRulesBody)}
          </Content>
          <Content component="p">
            {intl.formatMessage(
              messages.rulesTableNoRuleHitsDisabledRulesBodySecondLine,
            )}
          </Content>
        </>
      ),
    },
    rhdisabled: {
      title,
      body: (
        <Content component="p">
          {intl.formatMessage(
            messages.rulesTableNoRuleHitsRedHatDisabledRulesBody,
          )}
        </Content>
      ),
    },
    default: {
      title,
      body: (
        <Content component="p">
          {intl.formatMessage(messages.noRecommendations)}
        </Content>
      ),
    },
  };
};

/**
 * Column index to field name mapping for sorting
 * Maps table column indices to their corresponding API field names
 * @constant {Object}
 */
export const sortIndices = {
  0: 'description',
  1: 'publish_date',
  2: 'category',
  3: 'total_risk',
  4: 'impacted_systems_count',
  5: 'playbook_count',
};

/**
 * Sorts rules based on column index and direction
 * @param {Array} rules - Array of rules to sort
 * @param {Object} sortBy - Sort configuration with index and direction
 * @param {number} sortBy.index - Column index to sort by (0-5)
 * @param {string} sortBy.direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array of rules
 */
export const sortRules = (rules, sortBy) => {
  if (!sortBy || sortBy.index === undefined) {
    return rules;
  }

  const field = sortIndices[sortBy.index];
  const direction = sortBy.direction === 'asc' ? 1 : -1;

  return [...rules].sort((a, b) => {
    let aVal, bVal;

    switch (field) {
      case 'description':
        aVal = a.description.toLowerCase();
        bVal = b.description.toLowerCase();
        break;
      case 'publish_date':
        aVal = new Date(a.publish_date).getTime();
        bVal = new Date(b.publish_date).getTime();
        break;
      case 'category':
        aVal = a.category?.name?.toLowerCase() || '';
        bVal = b.category?.name?.toLowerCase() || '';
        break;
      case 'total_risk':
        aVal = a.total_risk;
        bVal = b.total_risk;
        break;
      case 'impacted_systems_count':
        aVal = a.impacted_systems_count;
        bVal = b.impacted_systems_count;
        break;
      case 'playbook_count':
        aVal = a.playbook_count;
        bVal = b.playbook_count;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return -1 * direction;
    if (aVal > bVal) return 1 * direction;
    return 0;
  });
};

/**
 * Builds URL query parameters from current state and updates browser URL
 * @param {Object} filters - Current filter state
 * @param {string} searchText - Current search text
 * @param {number} page - Current page number
 * @param {number} perPage - Items per page
 * @param {Object} sortBy - Sort configuration with index and direction
 */
export const urlBuilder = (filters, searchText, page, perPage, sortBy) => {
  const url = new URL(window.location);

  // Build filter params object
  const params = {
    ...filters,
    ...(searchText && { text: searchText }),
    offset: (page - 1) * perPage,
    limit: perPage,
  };

  // Add sort parameter if sortBy is set
  if (sortBy && sortBy.index !== undefined) {
    const field = sortIndices[sortBy.index];
    const sortParam = sortBy.direction === 'desc' ? `-${field}` : field;
    params.sort = sortParam;
  }

  // Remove undefined/null values
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });

  const queryString = `${Object.keys(params)
    .map(
      (key) =>
        `${key}=${
          Array.isArray(params[key]) ? params[key].join() : params[key]
        }`,
    )
    .join('&')}`;

  const urlParams = new URLSearchParams(queryString);

  window.history.replaceState(
    null,
    null,
    `${url.origin}${url.pathname}?${urlParams.toString()}${window.location.hash}`,
  );
};

/**
 * Parses URL query parameters and returns initial state for filters, pagination, and sorting
 * @param {string} [searchString=window.location.search] - URL query string to parse
 * @returns {Object} Parsed state object
 * @returns {Object} return.filters - Parsed filter state
 * @returns {number} return.page - Current page number
 * @returns {number} return.perPage - Items per page
 * @returns {string} return.searchText - Search text value
 * @returns {Object} return.sortBy - Sort configuration with index and direction
 */
export const urlFilterBuilder = (searchString = window.location.search) => {
  // Parse search string into params object
  const searchParams = new URLSearchParams(searchString);
  const paramsObject = Array.from(searchParams).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]:
        value === 'true' || value === 'false'
          ? JSON.parse(value)
          : key === 'text' ||
              key === 'limit' ||
              key === 'offset' ||
              key === 'rule_status' ||
              key === 'sort'
            ? value
            : value.split(','),
    }),
    {},
  );

  // Parse filters
  const filters = {
    total_risk: paramsObject.total_risk,
    res_risk: paramsObject.res_risk,
    impact: paramsObject.impact,
    likelihood: paramsObject.likelihood,
    category: paramsObject.category,
    incident: paramsObject.incident,
    has_playbook: paramsObject.has_playbook,
    reboot: paramsObject.reboot,
    rule_status: paramsObject.rule_status || 'enabled',
  };

  // Ensure boolean filters are arrays
  if (
    filters.has_playbook !== undefined &&
    !Array.isArray(filters.has_playbook)
  ) {
    filters.has_playbook = [`${filters.has_playbook}`];
  }
  if (filters.incident !== undefined && !Array.isArray(filters.incident)) {
    filters.incident = [`${filters.incident}`];
  }
  if (filters.reboot !== undefined && !Array.isArray(filters.reboot)) {
    filters.reboot = [`${filters.reboot}`];
  }

  // Parse pagination
  const page =
    paramsObject.offset !== undefined && paramsObject.limit !== undefined
      ? Math.floor(Number(paramsObject.offset) / Number(paramsObject.limit)) + 1
      : 1;
  const perPage =
    paramsObject.limit !== undefined ? Number(paramsObject.limit) : 20;

  // Parse search text
  const searchText = paramsObject.text || '';

  // Parse sort parameter
  let sortBy = {};
  if (paramsObject.sort) {
    const sortValue = paramsObject.sort;
    const direction = sortValue.startsWith('-') ? 'desc' : 'asc';
    const field = sortValue.startsWith('-') ? sortValue.slice(1) : sortValue;

    // Find the column index for this field
    const index = Object.keys(sortIndices).find(
      (key) => sortIndices[key] === field,
    );
    if (index !== undefined) {
      sortBy = { index: Number(index), direction };
    }
  }

  return { filters, page, perPage, searchText, sortBy };
};

/**
 * Custom hook for managing URL-synchronized filter and pagination state
 * Reads initial state from URL parameters and provides setters that update the URL
 * @returns {Object} State and setter functions for filters, search, pagination, and sorting
 * @returns {Object} return.filters - Current filter state object
 * @returns {Function} return.setFilters - Updates filters and URL
 * @returns {string} return.searchText - Current search text
 * @returns {Function} return.setSearchText - Updates search text and URL
 * @returns {number} return.page - Current page number
 * @returns {Function} return.setPage - Updates page and URL
 * @returns {number} return.perPage - Items per page
 * @returns {Function} return.setPerPage - Updates items per page and URL
 * @returns {Object} return.sortBy - Current sort configuration
 * @returns {Function} return.setSortBy - Updates sort and URL
 */
export const useUrlParams = () => {
  const location = useLocation();

  const [initialState] = useState(() => {
    return urlFilterBuilder(location.search);
  });
  const [initialized, setInitialized] = useState(false);
  const [filters, setFilters] = useState(initialState.filters);
  const [searchText, setSearchText] = useState(initialState.searchText);
  const [page, setPage] = useState(initialState.page);
  const [perPage, setPerPage] = useState(initialState.perPage);
  const [sortBy, setSortBy] = useState(initialState.sortBy);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      urlBuilder(filters, searchText, page, perPage, sortBy);
    }
  }, [filters, searchText, page, perPage, sortBy, initialized]);

  return {
    filters,
    setFilters,
    searchText,
    setSearchText,
    page,
    setPage,
    perPage,
    setPerPage,
    sortBy,
    setSortBy,
  };
};

/**
 * Opens the disable rule modal for a specific rule
 * @param {Object} rule - The rule object to disable
 * @param {Function} setSelectedRule - State setter for selected rule
 * @param {Function} setDisableRuleOpen - State setter to open the modal
 */
export const handleDisableRule = (
  rule,
  setSelectedRule,
  setDisableRuleOpen,
) => {
  setSelectedRule(rule);
  setDisableRuleOpen(true);
};

/**
 * Enables a disabled rule by deleting its acknowledgment via API
 * Shows success/error notifications and refetches data
 * @param {Object} rule - The rule object to enable
 * @param {Function} refetch - Function to refetch rules data
 * @param {Function} addNotification - Function to display notifications
 * @param {Object} intl - React Intl instance for translations
 * @returns {Promise<void>}
 */
export const handleEnableRule = async (
  rule,
  refetch,
  addNotification,
  intl,
) => {
  try {
    await DeleteApi(`/api/insights/v1/ack/${rule.rule_id}/`);
    addNotification({
      variant: 'success',
      title: intl.formatMessage(messages.recSuccessfullyEnabled, {
        title: rule.description,
      }),
    });
    refetch();
  } catch (error) {
    addNotification({
      variant: 'danger',
      title: intl.formatMessage(messages.error),
      description:
        error.message || intl.formatMessage(messages.rulesTableErrorStateBody),
    });
  }
};

/**
 * Returns available actions for a rule row based on its status
 * @param {Object} rule - The rule object
 * @param {boolean} isDisableRecEnabled - Whether disable/enable feature is enabled
 * @param {Object} intl - React Intl instance for translations
 * @param {Object} handlers - Object with onDisable and onEnable handler functions
 * @returns {Array} Array of action objects for ActionsColumn component
 */
export const getRowActions = (rule, isDisableRecEnabled, intl, handlers) => {
  if (!isDisableRecEnabled) {
    return [];
  }

  if (rule.rule_status === 'enabled') {
    return [
      {
        title: intl.formatMessage(messages.disableRule),
        onClick: () => handlers.onDisable(rule),
      },
    ];
  } else {
    return [
      {
        title: intl.formatMessage(messages.enableRule),
        onClick: () => handlers.onEnable(rule),
      },
    ];
  }
};
