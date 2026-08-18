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
  const result = await fn(...convertedParams);
  return compileResult(result, params);
};

export const combineParamsWithTableState = (
  tableStateParams,
  additionalParams,
) => {
  const { filters: tableFilters, ...restTableParams } = tableStateParams || {};
  const { filters: optionFilters, ...restAdditionalParams } =
    additionalParams || {};

  // Flatten filters to root level for Advisor API
  const combinedParams = {
    ...restTableParams,
    ...restAdditionalParams,
    ...(tableFilters || {}),
    ...(optionFilters || {}),
  };

  // Extract workload array params (not in insights-client TypeScript defs)
  // and pass through options.params so axios includes them in URL
  //THIS IS HOTFIX UNTIL INSIGHTS CLIENT WOULD HAVE WORKLOAD PARAM
  const { workload, ...typedParams } = combinedParams;

  const result = {
    ...typedParams,
    ...(workload ? { options: { params: { workload } } } : {}),
  };

  return result;
};
