export const combineParamsWithTableState = (
  tableStateParams = {},
  additionalParams = {},
) => {
  const combinedParams = {
    ...tableStateParams,
    ...additionalParams,
  };

  const tableFilters = tableStateParams?.filters;
  const additionalFilters = additionalParams?.filters;

  if (tableFilters && additionalFilters) {
    combinedParams.filters = {
      ...tableFilters,
      ...additionalFilters,
    };
  }

  return combinedParams;
};
