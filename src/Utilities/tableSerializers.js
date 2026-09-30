import snakeCase from 'lodash/snakeCase';

/**
 * Converts TableToolsTable pagination state to Advisor API format
 * @param {object} state - { page: number, perPage: number }
 * @returns {object} - { offset: number, limit: number }
 */
export const paginationSerialiser = ({ perPage, page } = {}) => {
  if (perPage && page) {
    const offset = (page - 1) * perPage;
    return { offset, limit: perPage };
  }
  return {};
};

/**
 * Converts TableToolsTable sort state to Advisor API format
 * @param {object} sortState - { index: number, direction: 'asc'|'desc' }
 * @param {array} columns - Table columns array with sortable property (e.g., { title: 'Name', sortable: 'description' })
 * @returns {string} - "-field_name" or "field_name"
 */
export const sortSerialiser = ({ index, direction } = {}, columns) => {
  return (
    columns?.[index]?.sortable &&
    `${direction === 'desc' ? '-' : ''}${columns[index].sortable}`
  );
};

/**
 * Converts TableToolsTable filter state to Advisor API format using per-filter serializers.
 *
 * TableToolsTable converts filter labels to IDs using lowercase and kebab-case:
 * - "Name" -> "name"
 * - "reboot required" -> "reboot-required"
 *
 * Our filter configs use snake_case IDs (e.g., "reboot_required"), so we normalize
 * kebab-case to snake_case for matching.
 *
 * @param {object} state - Filter state from table (e.g., { "reboot-required": ["true"] })
 * @param {array} filters - Filter configurations with optional filterSerialiser functions
 * @returns {object} - API-compatible filter params
 */
export const filtersSerialiser = (state, filters) => {
  return Object.entries(state || {}).reduce((params, [filterId, value]) => {
    const normalizedFilterId = filterId.replace(/-/g, '_');

    const filterConfig = filters.find(
      (f) =>
        f.id === filterId ||
        f.id === normalizedFilterId ||
        f.label?.toLowerCase() === filterId ||
        f.filterAttribute === filterId ||
        f.filterAttribute === normalizedFilterId,
    );

    if (!filterConfig) return params;

    // Use per-filter serializer if available
    if (filterConfig.filterSerialiser) {
      return {
        ...params,
        ...filterConfig.filterSerialiser(value, filterConfig, params),
      };
    }

    // Fallback to generic serialization
    switch (filterConfig.type) {
      case 'text':
        params[filterConfig.filterAttribute] = Array.isArray(value)
          ? value[0]
          : value;
        break;
      case 'checkbox':
        params[filterConfig.filterAttribute] = Array.isArray(value)
          ? value
          : [value];
        break;
      case 'radio':
        params[filterConfig.filterAttribute] = Array.isArray(value)
          ? value[0]
          : value;
        break;
      default:
        params[filterConfig.filterAttribute] = value;
    }

    return params;
  }, {});
};

/**
 * Converts table filter parameters to snake_case query format for the backend export endpoint
 * @param {object} params - Table filter params (e.g., { ruleStatus: 'enabled', totalRisk: ['4', '3'] })
 * @returns {object} - Backend-compatible query params (e.g., { rule_status: 'enabled', total_risk: '4,3' })
 */
export const toExportParams = (params = {}) =>
  Object.entries(params).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[snakeCase(key)] = Array.isArray(val) ? val.join(',') : val;
    }
    return acc;
  }, {});
