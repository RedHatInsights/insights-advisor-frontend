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
        params[filterConfig.urlParam] = Array.isArray(value) ? value[0] : value;
        break;
      case 'checkbox':
        params[filterConfig.urlParam] = Array.isArray(value) ? value : [value];
        break;
      case 'radio':
        params[filterConfig.urlParam] = Array.isArray(value) ? value[0] : value;
        break;
      default:
        params[filterConfig.urlParam] = value;
    }

    return params;
  }, {});
};
