import { useCallback } from 'react';
import useFetchBatched from './useFetchBatched';
import { createBatchedFetch } from './createBatchQueryEndpoint';
import { PAGINATION_TYPES } from './batchPaginationHelpers';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import Qs from 'qs';

/**
 * @typedef {object} UseAdvisorQueryReturn
 * @property {object} data - Query data
 * @property {boolean} isLoading - Loading state
 * @property {Error|null} error - Error object
 * @property {Function} refetch - Refetch function
 * @property {Function} fetchBatched - Manually trigger batched fetch
 * @property {Function} fetchAllIds - Fetch all IDs across all pages
 * @property {Function} exporter - Export all data
 * @property {object} progress - Progress tracking
 */

/**
 * Unified query hook for Advisor API with batching support
 *
 * This hook provides a consistent interface for querying Advisor APIs
 * with optional batching, similar to compliance-frontend's useComplianceQuery.
 * It wraps RTK Query functionality and adds batching capabilities.
 *
 * @param {string} endpoint - Endpoint name (e.g., 'recs', 'systems')
 * @param {object} config - Query configuration
 * @param {object} config.queryParams - Query parameters
 * @param {string} config.baseUrl - Base URL for the API
 * @param {string} config.url - Endpoint URL
 * @param {boolean} config.batch - Enable batching
 * @param {number} config.batchSize - Items per batch
 * @param {number} config.concurrency - Parallel requests
 * @param {string} config.paginationType - 'offset' or 'page'
 * @param {boolean} config.skip - Skip the query
 * @param {Function} config.onProgress - Progress callback
 * @returns {UseAdvisorQueryReturn} Query state and utilities
 *
 * @example
 * const {
 *   data,
 *   isLoading,
 *   fetchAllIds,
 *   exporter
 * } = useAdvisorQuery('recs', {
 *   baseUrl: BASE_URL,
 *   url: '/rule/',
 *   queryParams: { filter: 'active' },
 *   batch: true,
 *   batchSize: 50
 * });
 */
const useAdvisorQuery = (endpoint, config = {}) => {
  const {
    queryParams = {},
    baseUrl = '',
    url = '',
    batch = false,
    batchSize,
    concurrency,
    paginationType = PAGINATION_TYPES.OFFSET,
    onProgress,
    method = 'get',
  } = config;

  // Use the batching hook
  const {
    isLoading,
    data,
    error,
    progress,
    fetchBatched: fetchBatchedHook,
    reset,
  } = useFetchBatched({ endpoint });

  /**
   * Create an axios fetch function for this endpoint
   */
  const createFetchFunction = useCallback(
    (params = {}) => {
      const fullUrl = `${baseUrl}${url}`;

      return instance({
        url: fullUrl,
        method,
        params,
        paramsSerializer: (params) =>
          Qs.stringify(params, { arrayFormat: 'repeat' }),
      }).then((response) => response.data);
    },
    [baseUrl, url, method],
  );

  /**
   * Fetch data with batching
   */
  const fetchBatched = useCallback(
    async (customParams = {}) => {
      // Extract batch-specific params from customParams
      const {
        batchSize: customBatchSize,
        concurrency: customConcurrency,
        autoBatch: customAutoBatch,
        ...apiParams
      } = customParams;

      const mergedParams = { ...queryParams, ...apiParams };

      return await fetchBatchedHook({
        fetchFunction: createFetchFunction,
        queryParams: mergedParams,
        paginationType,
        batchSize: customBatchSize !== undefined ? customBatchSize : batchSize,
        concurrency:
          customConcurrency !== undefined ? customConcurrency : concurrency,
        onProgress,
        autoBatch: customAutoBatch !== undefined ? customAutoBatch : batch,
      });
    },
    [
      fetchBatchedHook,
      createFetchFunction,
      queryParams,
      paginationType,
      batchSize,
      concurrency,
      onProgress,
      batch,
    ],
  );

  /**
   * Fetch all IDs across all pages
   * Useful for bulk operations and selections
   */
  const fetchAllIds = useCallback(
    async (idField = 'id') => {
      const result = await fetchBatched();

      if (!result || !result.data) {
        return [];
      }

      return result.data.map((item) => item[idField]).filter(Boolean);
    },
    [fetchBatched],
  );

  /**
   * Export all data with batching
   * Fetches complete dataset for export purposes
   */
  const exporter = useCallback(
    async (customParams = {}, options = {}) => {
      const {
        transform = (data) => data,
        idField = 'id',
        includeIds = false,
      } = options;

      const result = await fetchBatched(customParams);

      if (!result || !result.data) {
        return includeIds ? { data: [], ids: [] } : [];
      }

      const transformedData = transform(result.data);

      if (includeIds) {
        const ids = result.data.map((item) => item[idField]).filter(Boolean);
        return {
          data: transformedData,
          ids,
          total: result.meta?.count || result.data.length,
        };
      }

      return transformedData;
    },
    [fetchBatched],
  );

  /**
   * Refetch the data
   */
  const refetch = useCallback(async () => {
    reset();
    return await fetchBatched();
  }, [reset, fetchBatched]);

  return {
    data,
    isLoading,
    error,
    progress,
    refetch,
    fetchBatched,
    fetchAllIds,
    exporter,
    reset,
  };
};

/**
 * Hook for creating a batched fetch function bound to a specific endpoint
 *
 * This is useful when you need an imperative fetch function that you can
 * call manually, rather than automatic fetching.
 *
 * @param {string} endpoint - Endpoint name
 * @param {object} config - Configuration
 * @returns {object} Fetch utilities
 *
 * @example
 * const { fetchBatched, isLoading } = useAdvisorBatchFetch('systems', {
 *   baseUrl: BASE_URL,
 *   url: '/system/',
 *   paginationType: 'offset'
 * });
 *
 * const systems = await fetchBatched({ filter: 'active' });
 */
export const useAdvisorBatchFetch = (endpoint, config = {}) => {
  const {
    baseUrl = '',
    url = '',
    paginationType = PAGINATION_TYPES.OFFSET,
    method = 'get',
  } = config;

  const {
    isLoading,
    error,
    progress,
    fetchBatched: fetchBatchedHook,
  } = useFetchBatched({ endpoint });

  const createFetchFunction = useCallback(
    (params = {}) => {
      const fullUrl = `${baseUrl}${url}`;

      return instance({
        url: fullUrl,
        method,
        params,
        paramsSerializer: (params) =>
          Qs.stringify(params, { arrayFormat: 'repeat' }),
      }).then((response) => response.data);
    },
    [baseUrl, url, method],
  );

  const fetchBatched = useCallback(
    async (queryParams = {}, batchOptions = {}) => {
      return await fetchBatchedHook({
        fetchFunction: createFetchFunction,
        queryParams,
        paginationType,
        ...batchOptions,
      });
    },
    [fetchBatchedHook, createFetchFunction, paginationType],
  );

  return {
    fetchBatched,
    isLoading,
    error,
    progress,
  };
};

/**
 * Create a standalone batched fetch function (non-hook)
 *
 * This is useful for use outside of React components, such as in
 * Redux thunks or utility functions.
 *
 * @param {string} endpoint - Endpoint name
 * @param {object} config - Configuration
 * @returns {Function} Batched fetch function
 *
 * @example
 * const fetchSystemsBatched = createAdvisorBatchFetch('systems', {
 *   baseUrl: BASE_URL,
 *   url: '/system/',
 *   paginationType: 'offset'
 * });
 *
 * const systems = await fetchSystemsBatched({ filter: 'active' });
 */
export const createAdvisorBatchFetch = (endpoint, config = {}) => {
  const {
    baseUrl = '',
    url = '',
    paginationType = PAGINATION_TYPES.OFFSET,
    method = 'get',
  } = config;

  const fetchFn = (params = {}) => {
    const fullUrl = `${baseUrl}${url}`;

    return instance({
      url: fullUrl,
      method,
      params,
      paramsSerializer: (params) =>
        Qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then((response) => response.data);
  };

  return createBatchedFetch(fetchFn, {
    endpoint,
    paginationType,
  });
};

export default useAdvisorQuery;
