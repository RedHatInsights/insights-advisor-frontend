/**
 * Combines table state parameters with additional parameters
 * Similar to compliance-frontend's helper
 *
 * @param {object} tableStateParams - Parameters from TableStateProvider (pagination, sort, filters)
 * @param {object} additionalParams - External parameters (tags, workloads, etc.)
 * @returns {object} - Combined parameters for API call
 */
export const combineParamsWithTableState = (
  tableStateParams = {},
  additionalParams = {},
) => {
  const combinedParams = {
    ...tableStateParams,
    ...additionalParams,
  };

  // merge filters
  const tableFilters = tableStateParams?.filters;
  const additionalFilters = additionalParams?.filters;

  if (tableFilters && additionalFilters) {
    // For REST API with comma-separated filters, we can merge them
    // Example: filters from table: { category: '1,2' }
    //          filters from external: { tags: 'prod,test' }
    // Result: both filters are preserved
    combinedParams.filters = {
      ...tableFilters,
      ...additionalFilters,
    };
  }

  return combinedParams;
};
