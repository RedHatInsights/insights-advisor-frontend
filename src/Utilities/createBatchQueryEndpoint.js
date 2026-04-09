import pAll from 'p-all';
import {
  calculateBatchPages,
  createBatchParams,
  mergeBatchResponses,
  normalizeBatchResponse,
  PAGINATION_TYPES,
} from './batchPaginationHelpers';
import { MIN_BATCH_THRESHOLD, mergeBatchOptions } from './batchConfig';

/**
 * Creates a batched query function for RTK Query endpoints
 *
 * This factory function generates a `queryFn` that can be used in RTK Query
 * endpoints to enable batching capabilities. Since RTK Query uses a declarative
 * approach, we can't use hooks directly in the query definition.
 *
 * @param {object} config - Configuration for the batched query
 * @param {Function} config.baseQuery - The RTK Query baseQuery function
 * @param {Function} config.buildUrl - Function that builds the URL for each request
 * @param {string} config.endpoint - Endpoint name for endpoint-specific defaults
 * @param {string} config.paginationType - 'offset' or 'page'
 * @returns {Function} A queryFn compatible with RTK Query
 *
 * @example
 * const getRecs = build.query({
 *   queryFn: createBatchedQueryFn({
 *     baseQuery,
 *     buildUrl: (params) => ({ url: '/rule/', options: params }),
 *     endpoint: 'recs',
 *     paginationType: 'offset'
 *   })
 * });
 */
export const createBatchedQueryFn = (config) => {
  const {
    baseQuery,
    buildUrl,
    endpoint,
    paginationType = PAGINATION_TYPES.OFFSET,
  } = config;

  return async (args, api, extraOptions) => {
    const {
      batch = false,
      batchSize: customBatchSize,
      concurrency: customConcurrency,
      autoBatch = true,
      ...queryParams
    } = args || {};

    if (!batch) {
      const queryArgs = buildUrl(queryParams);
      return await baseQuery(queryArgs, api, extraOptions);
    }

    const mergedOptions = mergeBatchOptions(
      {
        batchSize: customBatchSize,
        concurrency: customConcurrency,
        paginationType,
      },
      endpoint,
    );

    const { batchSize, concurrency } = mergedOptions;

    try {
      let estimatedTotalPages = 1;

      const firstPageParams = createBatchParams(
        0,
        batchSize,
        queryParams,
        paginationType,
      );
      const firstPageArgs = {
        ...buildUrl(firstPageParams),
        batchMetadata: {
          index: 0,
          total: estimatedTotalPages,
          batchSize,
        },
      };
      const firstPageResult = await baseQuery(firstPageArgs, api, extraOptions);

      if (firstPageResult.error) {
        return firstPageResult;
      }

      // Extract response data (RTK Query wraps it in { data: ... })
      const firstPageData = firstPageResult.data;
      const normalizedFirst = normalizeBatchResponse(
        firstPageData,
        paginationType,
      );

      const total =
        normalizedFirst.meta.count || normalizedFirst.meta.total || 0;

      if (autoBatch && total <= MIN_BATCH_THRESHOLD) {
        return { data: normalizedFirst };
      }

      if (total <= batchSize) {
        return { data: normalizedFirst };
      }

      const totalPages = calculateBatchPages(total, batchSize);
      const batchRequests = [];

      for (let pageIdx = 1; pageIdx < totalPages; pageIdx++) {
        batchRequests.push(async () => {
          const params = createBatchParams(
            pageIdx,
            batchSize,
            queryParams,
            paginationType,
          );
          const requestArgs = {
            ...buildUrl(params),
            batchMetadata: {
              index: pageIdx,
              total: totalPages,
              batchSize,
            },
          };
          const result = await baseQuery(requestArgs, api, extraOptions);

          if (result.error) {
            throw new Error(
              `Batch request failed: ${JSON.stringify(result.error)}`,
            );
          }

          const responseData = result.data;
          return normalizeBatchResponse(responseData, paginationType);
        });
      }

      const batchResponses = await pAll(batchRequests, { concurrency });

      const allResponses = [normalizedFirst, ...batchResponses];
      const mergedResult = mergeBatchResponses(allResponses, true);

      return { data: mergedResult };
    } catch (error) {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: error.message || 'Batch fetching failed',
          error: error,
        },
      };
    }
  };
};

/**
 * Helper to add batching capability to an existing RTK Query endpoint
 *
 * This is a higher-level utility that takes an existing endpoint definition
 * and returns a new one with batching support.
 *
 * @param {Function} baseQuery - The RTK Query baseQuery
 * @param {object} endpointDef - Original endpoint definition
 * @param {object} batchConfig - Batch configuration
 * @returns {object} Enhanced endpoint definition
 *
 * @example
 * const getRecsBatched = addBatchingToEndpoint(
 *   baseQuery,
 *   { query: (options) => ({ url: '/rule/', ...options }) },
 *   { endpoint: 'recs', paginationType: 'offset' }
 * );
 */
export const addBatchingToEndpoint = (
  baseQuery,
  endpointDef,
  batchConfig = {},
) => {
  const { endpoint, paginationType = PAGINATION_TYPES.OFFSET } = batchConfig;

  // Extract the original query function
  const originalQuery = endpointDef.query;

  if (!originalQuery) {
    throw new Error('Endpoint definition must have a query function');
  }

  // Create batched queryFn
  const queryFn = createBatchedQueryFn({
    baseQuery,
    buildUrl: originalQuery,
    endpoint,
    paginationType,
  });

  // Return new endpoint definition with queryFn
  return {
    ...endpointDef,
    queryFn,
    // Remove the original query since we're using queryFn
    query: undefined,
  };
};

/**
 * Create a standard batched fetch function (non-RTK Query)
 *
 * This is useful for imperative fetching outside of RTK Query hooks,
 * similar to compliance-frontend's pattern.
 *
 * @param {Function} fetchFn - Function that performs the actual fetch
 * @param {object} options - Batch options
 * @returns {Function} Batched fetch function
 *
 * @example
 * const fetchSystemsBatched = createBatchedFetch(
 *   (params) => axios.get('/api/systems', { params }),
 *   { endpoint: 'systems', paginationType: 'offset' }
 * );
 *
 * const result = await fetchSystemsBatched({ filter: 'active' });
 */
export const createBatchedFetch = (fetchFn, options = {}) => {
  const { endpoint, paginationType = PAGINATION_TYPES.OFFSET } = options;

  return async (queryParams = {}, batchOptions = {}) => {
    const {
      batchSize: customBatchSize,
      concurrency: customConcurrency,
      autoBatch = true,
    } = batchOptions;

    // Merge batch options
    const mergedOptions = mergeBatchOptions(
      {
        batchSize: customBatchSize,
        concurrency: customConcurrency,
        paginationType,
      },
      endpoint,
    );

    const { batchSize, concurrency } = mergedOptions;

    // Fetch first page
    const firstPageParams = createBatchParams(
      0,
      batchSize,
      queryParams,
      paginationType,
    );
    const firstPageResponse = await fetchFn(firstPageParams);
    const normalizedFirst = normalizeBatchResponse(
      firstPageResponse,
      paginationType,
    );
    const total = normalizedFirst.meta.count || normalizedFirst.meta.total || 0;

    // Check if batching is needed
    const shouldBatch = autoBatch
      ? total > MIN_BATCH_THRESHOLD
      : total > batchSize;

    if (!shouldBatch || total <= batchSize) {
      return normalizedFirst;
    }

    // Create batch requests
    const totalPages = calculateBatchPages(total, batchSize);
    const batchRequests = [];

    for (let pageIdx = 1; pageIdx < totalPages; pageIdx++) {
      batchRequests.push(async () => {
        const params = createBatchParams(
          pageIdx,
          batchSize,
          queryParams,
          paginationType,
        );
        const response = await fetchFn(params);
        return normalizeBatchResponse(response, paginationType);
      });
    }

    // Execute and merge
    const batchResponses = await pAll(batchRequests, { concurrency });
    const allResponses = [normalizedFirst, ...batchResponses];
    return mergeBatchResponses(allResponses, true);
  };
};

export default {
  createBatchedQueryFn,
  addBatchingToEndpoint,
  createBatchedFetch,
};
