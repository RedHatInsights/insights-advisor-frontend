import { useCallback, useState, useRef, useEffect } from 'react';
import pAll from 'p-all';
import {
  calculateBatchPages,
  createBatchParams,
  mergeBatchResponses,
  normalizeBatchResponse,
  validateBatchParams,
  PAGINATION_TYPES,
} from './batchPaginationHelpers';
import {
  MIN_BATCH_THRESHOLD,
  MAX_BATCH_TOTAL,
  BATCH_WARNING_THRESHOLD,
  mergeBatchOptions,
} from './batchConfig';

/**
 * @typedef {object} BatchProgress
 * @property {number} current - Current number of completed batches
 * @property {number} total - Total number of batches
 * @property {number} percentage - Completion percentage (0-100)
 */

/**
 * @typedef {object} UseFetchBatchedReturn
 * @property {boolean} isLoading - Whether batching is in progress
 * @property {object|null} data - Combined result of all batch requests
 * @property {Error|null} error - Error object if batching failed
 * @property {BatchProgress} progress - Progress tracking information
 * @property {Function} fetchBatched - Function to trigger batched requests
 * @property {Function} reset - Function to reset state
 */

/**
 * Hook for performing batched API requests with concurrency control
 *
 * This hook enables efficient fetching of large datasets by:
 * - Making an initial request to get the total count
 * - Calculating required pages based on batch size
 * - Making parallel requests with configurable concurrency
 * - Merging all responses into a single result
 *
 * Supports both offset/limit (Advisor API) and page/per_page (Inventory API) pagination.
 *
 * @param {object} options - Configuration options
 * @param {string} options.endpoint - Endpoint name for endpoint-specific defaults
 * @returns {UseFetchBatchedReturn} Batching utilities and state
 *
 * @example
 * const { fetchBatched, isLoading, progress } = useFetchBatched();
 *
 * const allData = await fetchBatched({
 *   fetchFunction: async (params) => axios.get('/api/systems', { params }),
 *   queryParams: { filter: 'active' },
 *   paginationType: 'offset',
 *   batchSize: 50,
 *   concurrency: 2
 * });
 */
const useFetchBatched = (options = {}) => {
  const { endpoint } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });

  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Update progress state
   */
  const updateProgress = useCallback((current, total) => {
    if (!isMounted.current) return;

    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    setProgress({ current, total, percentage });
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (!isMounted.current) return;

    setIsLoading(false);
    setData(null);
    setError(null);
    setProgress({ current: 0, total: 0, percentage: 0 });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Main batching function
   *
   * @param {object} config - Batch configuration
   * @param {Function} config.fetchFunction - Async function that makes the API call
   * @param {object} config.queryParams - Base query parameters
   * @param {string} config.paginationType - 'offset' or 'page'
   * @param {number} config.batchSize - Items per batch
   * @param {number} config.concurrency - Parallel requests
   * @param {Function} config.onProgress - Optional progress callback
   * @param {boolean} config.autoBatch - Auto-batch if total > threshold
   * @returns {Promise<object>} Merged batch results
   */
  const fetchBatched = useCallback(
    async (config) => {
      const {
        fetchFunction,
        queryParams = {},
        paginationType = PAGINATION_TYPES.OFFSET,
        batchSize: customBatchSize,
        concurrency: customConcurrency,
        onProgress,
        autoBatch = true,
      } = config;

      if (!fetchFunction || typeof fetchFunction !== 'function') {
        const err = new Error(
          'fetchFunction is required and must be a function',
        );
        setError(err);
        throw err;
      }

      // Merge options with endpoint-specific or global defaults
      const mergedOptions = mergeBatchOptions(
        {
          batchSize: customBatchSize,
          concurrency: customConcurrency,
          paginationType,
        },
        endpoint,
      );

      const { batchSize, concurrency } = mergedOptions;

      // Validate parameters
      const validation = validateBatchParams({
        batchSize,
        concurrency,
        paginationType,
      });

      if (!validation.isValid) {
        const err = new Error(
          `Invalid batch parameters: ${validation.errors.join(', ')}`,
        );
        setError(err);
        throw err;
      }

      // Reset state and create new abort controller
      reset();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch first page to get total count
        const firstPageParams = createBatchParams(
          0,
          batchSize,
          queryParams,
          paginationType,
        );
        const firstPageResponse = await fetchFunction(firstPageParams);

        if (!isMounted.current) {
          throw new Error('Component unmounted during fetch');
        }

        // Normalize the first response
        const normalizedFirst = normalizeBatchResponse(
          firstPageResponse,
          paginationType,
        );
        const total =
          normalizedFirst.meta.count || normalizedFirst.meta.total || 0;

        // Check for large datasets
        if (total > MAX_BATCH_TOTAL) {
          console.warn(
            `Dataset size (${total}) exceeds maximum batch total (${MAX_BATCH_TOTAL}). Consider adding filters.`,
          );
        } else if (total > BATCH_WARNING_THRESHOLD) {
          console.warn(
            `Large dataset detected (${total} items). Batching may take some time.`,
          );
        }

        // Step 2: Determine if batching is needed
        const shouldBatch = autoBatch
          ? total > MIN_BATCH_THRESHOLD
          : total > batchSize;

        if (!shouldBatch || total <= batchSize) {
          // No batching needed, return first page result
          updateProgress(1, 1);
          if (onProgress) onProgress({ current: 1, total: 1, percentage: 100 });

          if (isMounted.current) {
            setData(normalizedFirst);
            setIsLoading(false);
          }

          return normalizedFirst;
        }

        // Step 3: Calculate remaining pages
        const totalPages = calculateBatchPages(total, batchSize);

        updateProgress(1, totalPages);
        if (onProgress) {
          onProgress({
            current: 1,
            total: totalPages,
            percentage: Math.round((1 / totalPages) * 100),
          });
        }

        // Step 4: Create batch requests for remaining pages
        const batchRequests = [];
        for (let pageIdx = 1; pageIdx < totalPages; pageIdx++) {
          batchRequests.push(async () => {
            if (abortControllerRef.current?.signal.aborted) {
              throw new Error('Batch requests aborted');
            }

            const params = createBatchParams(
              pageIdx,
              batchSize,
              queryParams,
              paginationType,
            );
            const response = await fetchFunction(params);
            const normalized = normalizeBatchResponse(response, paginationType);

            // Update progress
            const currentPage = pageIdx + 1;
            updateProgress(currentPage, totalPages);
            if (onProgress) {
              onProgress({
                current: currentPage,
                total: totalPages,
                percentage: Math.round((currentPage / totalPages) * 100),
              });
            }

            return normalized;
          });
        }

        // Step 5: Execute batch requests with concurrency control
        const batchResponses = await pAll(batchRequests, { concurrency });

        if (!isMounted.current) {
          throw new Error('Component unmounted during batch processing');
        }

        // Step 6: Merge all responses
        const allResponses = [normalizedFirst, ...batchResponses];
        const mergedResult = mergeBatchResponses(allResponses, true);

        // Verify we got all the data we expected
        const expectedTotal = total;
        const actualTotal = mergedResult.data.length;

        if (actualTotal !== expectedTotal) {
          console.warn(
            `Batching completed but item count mismatch. Expected: ${expectedTotal}, Actual: ${actualTotal}`,
          );
        }

        if (isMounted.current) {
          setData(mergedResult);
          setIsLoading(false);
        }

        return mergedResult;
      } catch (err) {
        if (!isMounted.current) {
          return null;
        }

        console.error('Batch fetching failed:', err);
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [endpoint, reset, updateProgress],
  );

  return {
    isLoading,
    data,
    error,
    progress,
    fetchBatched,
    reset,
  };
};

export default useFetchBatched;
