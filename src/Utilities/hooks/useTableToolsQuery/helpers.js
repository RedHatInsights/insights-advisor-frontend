export const TOTAL_REQUEST_PARAMS = {
  limit: 1,
};

export const defaultCompileResult = (fetchResult, params) => {
  const data = fetchResult?.data || fetchResult;
  const meta = fetchResult?.meta;

  return {
    data,
    meta: {
      ...params,
      ...(meta || {}),
      total: meta?.count,
    },
  };
};

export const compileTotalResult = (fetchResult) => fetchResult?.meta?.total;

export const hasRequiredParams = (requiredParams, params = {}) => {
  if (!requiredParams) {
    return true;
  } else {
    const paramsToCheck =
      typeof requiredParams === 'string' ? [requiredParams] : requiredParams;

    const missingParam = paramsToCheck.find(
      (requiredParam) => !(requiredParam in params),
    );
    if (missingParam) {
      console.error(`Missing required parameter: '${missingParam}'`);
    }
  }
};

export const fetchResult = async (
  fn,
  params,
  convertToArray,
  compileResult,
) => {
  const convertedParams = convertToArray(params);
  return compileResult(await fn(...convertedParams), params);
};

export const combineParamsWithTableState = (
  tableStateParams,
  additionalParams,
) => {
  const { filters: tableFilters, ...restTableParams } = tableStateParams || {};
  const { filters: optionFilters, ...restAdditionalParams } =
    additionalParams || {};

  // Flatten filters to root level for Advisor API
  return {
    ...restTableParams,
    ...restAdditionalParams,
    ...(tableFilters || {}),
    ...(optionFilters || {}),
  };
};
