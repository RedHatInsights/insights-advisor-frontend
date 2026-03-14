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
 * @param {object} sortIndices - Mapping of column index to API field name (e.g., { 0: 'description', 1: 'total_risk' })
 * @returns {string} - "-field_name" or "field_name"
 */
export const sortSerialiser = ({ index, direction } = {}, sortIndices) => {
  const field = sortIndices?.[index];
  if (!field) return undefined;
  return direction === 'desc' ? `-${field}` : field;
};

/**
 * Converts TableToolsTable filter state to Advisor API format
 * @param {object} state - Filter state from table
 * @param {array} filters - Filter configuration
 * @returns {object} - API-compatible filter params
 */
export const filtersSerialiser = (state, filters) => {
  const params = {};

  Object.entries(state || {}).forEach(([filterId, value]) => {
    const filterConfig = filters.find((f) => f.id === filterId);
    if (!filterConfig) return;

    switch (filterConfig.type) {
      case 'text':
        params.text = value;
        break;
      case 'checkbox':
        params[filterConfig.urlParam] = Array.isArray(value)
          ? value.join(',')
          : value;
        break;
      case 'radio':
        params[filterConfig.urlParam] = Array.isArray(value) ? value[0] : value;
        break;
      default:
        params[filterConfig.urlParam] = value;
    }
  });

  return params;
};
