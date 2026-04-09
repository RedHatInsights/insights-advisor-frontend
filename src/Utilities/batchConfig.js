/**
 * Batch Request Configuration
 *
 * This file contains configuration constants for batch request functionality.
 * These settings control how API requests are batched to improve performance
 * when fetching large datasets.
 */

/**
 * Default batch size - number of items to fetch per request
 * Lower values = more requests but less data per request
 * Higher values = fewer requests but more data per request
 */
export const DEFAULT_BATCH_SIZE = 50;

/**
 * Default concurrency - number of parallel requests to make
 * Lower values = slower but less server load
 * Higher values = faster but may trigger rate limits
 */
export const DEFAULT_CONCURRENCY = 2;

/**
 * Maximum allowed concurrency to prevent overwhelming the server
 */
export const MAX_CONCURRENCY = 5;

/**
 * Minimum threshold for batching
 * If total items < this value, don't bother batching
 */
export const MIN_BATCH_THRESHOLD = 50;

/**
 * Timeout for each individual batch request (in milliseconds)
 */
export const TIMEOUT_PER_REQUEST = 30000; // 30 seconds

/**
 * Number of retry attempts for failed batch requests
 */
export const RETRY_ATTEMPTS = 2;

/**
 * Maximum total items to fetch with batching
 * This prevents memory issues with extremely large datasets
 */
export const MAX_BATCH_TOTAL = 10000;

/**
 * Warning threshold - show warning if total exceeds this
 */
export const BATCH_WARNING_THRESHOLD = 5000;

/**
 * Per-endpoint configuration overrides
 * Allows fine-tuning batch behavior for specific API endpoints
 */
export const ENDPOINT_BATCH_CONFIG = {
  recs: {
    batchSize: 50,
    concurrency: 2,
    paginationType: 'offset', // offset/limit style
  },
  systems: {
    batchSize: 100,
    concurrency: 3,
    paginationType: 'offset',
  },
  pathways: {
    batchSize: 50,
    concurrency: 2,
    paginationType: 'offset',
  },
  topics: {
    batchSize: 50,
    concurrency: 2,
    paginationType: 'offset',
  },
  inventory: {
    batchSize: 100,
    concurrency: 3,
    paginationType: 'page', // page/per_page style
  },
  hostack: {
    batchSize: 100,
    concurrency: 2,
    paginationType: 'offset',
  },
};

/**
 * Get batch configuration for a specific endpoint
 *
 * @param {string} endpoint - The endpoint name (e.g., 'recs', 'systems')
 * @returns {object} Configuration object with batchSize, concurrency, and paginationType
 */
export const getBatchConfig = (endpoint) => {
  return (
    ENDPOINT_BATCH_CONFIG[endpoint] || {
      batchSize: DEFAULT_BATCH_SIZE,
      concurrency: DEFAULT_CONCURRENCY,
      paginationType: 'offset',
    }
  );
};

/**
 * Merge custom batch options with defaults
 *
 * @param {object} options - Custom options to override defaults
 * @param {string} endpoint - Optional endpoint name for endpoint-specific defaults
 * @returns {object} Merged configuration
 */
export const mergeBatchOptions = (options = {}, endpoint = null) => {
  const defaults = endpoint
    ? getBatchConfig(endpoint)
    : {
        batchSize: DEFAULT_BATCH_SIZE,
        concurrency: DEFAULT_CONCURRENCY,
        paginationType: 'offset',
      };

  const filteredOptions = Object.entries(options).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );

  return {
    ...defaults,
    ...filteredOptions,
    concurrency: Math.min(
      filteredOptions.concurrency || defaults.concurrency,
      MAX_CONCURRENCY,
    ),
  };
};

export default {
  DEFAULT_BATCH_SIZE,
  DEFAULT_CONCURRENCY,
  MAX_CONCURRENCY,
  MIN_BATCH_THRESHOLD,
  TIMEOUT_PER_REQUEST,
  RETRY_ATTEMPTS,
  MAX_BATCH_TOTAL,
  BATCH_WARNING_THRESHOLD,
  ENDPOINT_BATCH_CONFIG,
  getBatchConfig,
  mergeBatchOptions,
};
