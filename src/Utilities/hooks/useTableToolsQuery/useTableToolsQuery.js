import useAdvisorApi from '../useAdvisorApi';
import { useDeepCompareMemo, useDeepCompareCallback } from 'use-deep-compare';

import { useQueryWithUtilities } from 'bastilian-tabletools';
import {
  compileTotalResult,
  defaultCompileResult,
  fetchResult,
  TOTAL_REQUEST_PARAMS,
  combineParamsWithTableState,
  hasRequiredParams,
} from './helpers';

/**
 * Generic hook to use an Advisor API endpoint
 * Similar to compliance-frontend's useTableToolsQuery
 *
 * @param {string} endpoint - Name of the insights-client endpoint (e.g., 'pathwayList', 'ruleList')
 * @param {object} options - Query options
 * @param {object} options.params - Additional params to pass to the API
 * @param {string|string[]} options.requiredParams - Required parameter names
 * @param {boolean} options.useTableState - Whether to use table state from TableStateProvider
 * @param {boolean} options.batched - Whether to use batched queries
 * @param {boolean} options.skip - Skip the query
 * @param {object} options.batch - Batch options
 * @param {boolean} options.onlyTotal - Only fetch the total count
 * @param {Function} options.convertToArray - Function to convert params object to array for API call
 * @param {object} options.useQueryOptions - Additional options for useQueryWithUtilities
 * @returns {object} Query result with data, loading, error, etc.
 */
const useTableToolsQuery = (
  endpoint,
  {
    params: paramsOption = {},
    requiredParams,
    useTableState = false,
    batched = false,
    skip: skipOption,
    batch = {},
    onlyTotal,
    convertToArray,
    useQueryOptions = {},
  } = {},
) => {
  const apiEndpoint = useAdvisorApi(endpoint);
  !skipOption && hasRequiredParams(requiredParams, paramsOption);

  const fetchApi = useDeepCompareCallback(
    async (fetchParams = {}) => {
      const allFetchParams = {
        ...fetchParams,
        ...(onlyTotal ? TOTAL_REQUEST_PARAMS : {}),
      };
      return await fetchResult(
        apiEndpoint,
        allFetchParams,
        convertToArray,
        onlyTotal ? compileTotalResult : defaultCompileResult,
      );
    },
    [apiEndpoint, paramsOption, convertToArray, onlyTotal],
  );

  const queryOptions = useDeepCompareMemo(
    () => ({
      fetchFn: fetchApi,
      queryKey: [endpoint],
      enabled: !skipOption,
      batched,
      useTableState,
      params: paramsOption,
      combineParamsWithTableState,
      totalBatched: batch,
      tableQueries: useQueryOptions,
    }),
    [
      fetchApi,
      endpoint,
      skipOption,
      batched,
      useTableState,
      paramsOption,
      batch,
      useQueryOptions,
    ],
  );

  const {
    result: queryData,
    error: queryError,
    loading: queryLoading,
    refetch,
    query: query,
    queryTotalBatched,
    queryQueue,
    queryBatchedQueue,
    itemIdsInTable,
    exporter,
  } = useQueryWithUtilities(queryOptions);

  return {
    data: queryData,
    error: queryError,
    loading: queryLoading,
    refetch,
    query,
    queryTotalBatched,
    fetchBatchedQueue: queryBatchedQueue,
    fetchQueue: queryQueue,
    exporter,
    fetchAllIds: itemIdsInTable,
  };
};

export default useTableToolsQuery;
