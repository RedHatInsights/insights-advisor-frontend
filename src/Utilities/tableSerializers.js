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
 * Converts label to kebab-case ID (matches tabletools stringToId)
 * @param {string} string - Label string
 * @returns {string} - Kebab-case ID
 */
const stringToId = (string) =>
  string ? string.split(/\s+/).join('-').toLowerCase() : '';

/**
 * Converts TableToolsTable filter state to Advisor API format
 * @param {object} state - Filter state from table
 * @param {array} filters - Filter configuration
 * @returns {object} - API-compatible filter params
 */
export const filtersSerialiser = (state, filters) => {
  const params = {};

  Object.entries(state || {}).forEach(([filterId, value]) => {
    // Try to find filter by ID first, then by stringToId(label)
    const filterConfig = filters.find(
      (f) => f.id === filterId || stringToId(f.label) === filterId,
    );
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
