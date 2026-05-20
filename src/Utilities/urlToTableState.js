import { paramParser } from '../PresentationalComponents/Common/Tables';

/**
 * Converts URL offset/limit to table pagination state
 */
export const deserializePaginationFromUrl = (urlParams) => {
  if (!urlParams.offset && !urlParams.limit) return undefined;

  const offset = Number(urlParams.offset?.[0] || 0);
  const limit = Number(urlParams.limit?.[0] || 20);

  return {
    page: Math.floor(offset / limit) + 1,
    perPage: limit,
  };
};

/**
 * Converts URL sort param to table sort state
 * @param {object} urlParams - Parsed URL params
 * @param {array} columns - Table columns with sortable property
 * @returns {{ index: number, direction: string } | undefined}
 */
export const deserializeSortFromUrl = (urlParams, columns) => {
  if (!urlParams.sort) return undefined;

  const sortValue = Array.isArray(urlParams.sort)
    ? urlParams.sort[0]
    : urlParams.sort;
  const direction = sortValue.startsWith('-') ? 'desc' : 'asc';
  const fieldName = sortValue.replace(/^-/, '');

  const index = columns.findIndex((col) => col.sortable === fieldName);

  return index !== -1 ? { index, direction } : undefined;
};

/**
 * Converts URL filter params to table filter state
 * @param {object} urlParams - Parsed URL params
 * @param {array} filters - Filter configurations
 * @returns {object} Filter state object
 */
export const deserializeFiltersFromUrl = (urlParams, filters) => {
  const filterState = {};

  filters.forEach((filterConfig) => {
    const urlParam = filterConfig.urlParam;

    if (urlParams[urlParam]) {
      // Convert snake_case to kebab-case for table state
      const filterId = filterConfig.id || urlParam.replace(/_/g, '-');
      const value = urlParams[urlParam];

      filterState[filterId] = Array.isArray(value) ? value : [value];
    }
  });

  return Object.keys(filterState).length > 0 ? filterState : undefined;
};

/**
 * Converts URL params to TableStateProvider initialState
 */
export const deserializeUrlToTableState = (columns, filters) => {
  const urlParams = paramParser();
  const state = {};

  const pagination = deserializePaginationFromUrl(urlParams);
  if (pagination) state.pagination = pagination;

  const sort = deserializeSortFromUrl(urlParams, columns);
  if (sort) state.sort = sort;

  const filterState = deserializeFiltersFromUrl(urlParams, filters);
  if (filterState) state.filter = filterState;

  return state;
};
