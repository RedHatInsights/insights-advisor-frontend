export const PAGINATION_TYPES = {
  OFFSET: 'offset',
  PAGE: 'page',
};

/**
 * Calculate the number of pages needed for batching
 *
 * @param {number} total - Total number of items
 * @param {number} batchSize - Number of items per batch
 * @returns {number} Number of pages needed
 */
export const calculateBatchPages = (total, batchSize) => {
  if (!total || total <= 0) return 0;
  if (!batchSize || batchSize <= 0) return 0;
  return Math.ceil(total / batchSize);
};

/**
 * Create pagination parameters for a specific batch/page
 *
 * @param {number} pageIndex - Zero-based page index (0, 1, 2, ...)
 * @param {number} batchSize - Number of items per batch
 * @param {object} baseParams - Base parameters to merge with pagination params
 * @param {string} paginationType - Type of pagination ('offset' or 'page')
 * @returns {object} Parameters object with pagination fields
 */
export const createBatchParams = (
  pageIndex,
  batchSize,
  baseParams = {},
  paginationType = PAGINATION_TYPES.OFFSET,
) => {
  const params = { ...baseParams };

  if (paginationType === PAGINATION_TYPES.PAGE) {
    params.page = pageIndex + 1;
    params.per_page = batchSize;
  } else {
    params.offset = pageIndex * batchSize;
    params.limit = batchSize;
  }

  return params;
};

/**
 * Convert page-based parameters to offset-based
 *
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Items per page
 * @returns {object} Object with offset and limit
 */
export const pageToOffset = (page, perPage) => {
  const pageNum = Math.max(1, page || 1);
  const itemsPerPage = Math.max(1, perPage || 10);

  return {
    offset: (pageNum - 1) * itemsPerPage,
    limit: itemsPerPage,
  };
};

/**
 * Convert offset-based parameters to page-based
 *
 * @param {number} offset - Offset value (0-indexed)
 * @param {number} limit - Limit/items per page
 * @returns {object} Object with page and per_page
 */
export const offsetToPage = (offset, limit) => {
  const offsetVal = Math.max(0, offset || 0);
  const limitVal = Math.max(1, limit || 10);

  return {
    page: Math.floor(offsetVal / limitVal) + 1,
    per_page: limitVal,
  };
};

/**
 * Extract pagination metadata from API response
 *
 * @param {object} response - API response object
 * @param {string} paginationType - Type of pagination used
 * @returns {object} Normalized pagination metadata
 */
export const extractPaginationMeta = (response, paginationType) => {
  const meta = response?.meta || {};

  if (paginationType === PAGINATION_TYPES.PAGE) {
    return {
      total: meta.count || meta.total || 0,
      page: meta.page || 1,
      perPage: meta.per_page || 0,
      offset: meta.page ? (meta.page - 1) * (meta.per_page || 0) : 0,
      limit: meta.per_page || 0,
    };
  } else {
    return {
      total: meta.count || meta.total || 0,
      offset: meta.offset || 0,
      limit: meta.limit || 0,
      page:
        meta.offset && meta.limit
          ? Math.floor(meta.offset / meta.limit) + 1
          : 1,
      perPage: meta.limit || 0,
    };
  }
};

/**
 * Normalize response to a consistent format regardless of pagination type
 *
 * @param {object} response - API response
 * @param {string} paginationType - Type of pagination used
 * @returns {object} Normalized response with data and meta
 */
export const normalizeBatchResponse = (response, paginationType) => {
  if (!response) {
    return { data: [], meta: { count: 0, total: 0 } };
  }

  const data = response.data || [];
  const paginationMeta = extractPaginationMeta(response, paginationType);

  return {
    data,
    meta: {
      // Use 'count' as the primary total field (Advisor API convention)
      count: paginationMeta.total,
      // Also include 'total' for compatibility
      total: paginationMeta.total,
      offset: paginationMeta.offset,
      limit: paginationMeta.limit,
      page: paginationMeta.page,
      per_page: paginationMeta.perPage,
      // Preserve any other meta fields from original response
      ...response.meta,
    },
  };
};

/**
 * Merge multiple batch responses into a single response
 *
 * @param {Array} responses - Array of API responses
 * @param {boolean} preserveFirstMeta - If true, preserve meta from first response
 * @returns {object} Merged response with combined data array
 */
export const mergeBatchResponses = (responses, preserveFirstMeta = true) => {
  if (!responses || responses.length === 0) {
    return { data: [], meta: { count: 0, total: 0 } };
  }

  // Merge all data arrays
  const allData = responses.reduce((acc, response) => {
    const data = response?.data || [];
    return [...acc, ...data];
  }, []);

  // Use meta from first response, but update count/total to reflect merged data
  const firstResponse = responses[0] || {};
  const firstMeta = firstResponse.meta || {};

  // Calculate actual total from first response
  const originalTotal = firstMeta.count || firstMeta.total || 0;

  return {
    data: allData,
    meta: {
      ...firstMeta,
      // Preserve the original total count
      count: preserveFirstMeta ? originalTotal : allData.length,
      total: preserveFirstMeta ? originalTotal : allData.length,
      // Update offset and limit to reflect merged result
      offset: 0,
      limit: allData.length,
    },
  };
};

/**
 * Validate batch parameters
 *
 * @param {object} params - Batch parameters to validate
 * @returns {object} Validation result with isValid and errors
 */
export const validateBatchParams = (params) => {
  const errors = [];

  if (params.batchSize !== undefined) {
    if (typeof params.batchSize !== 'number' || params.batchSize <= 0) {
      errors.push('batchSize must be a positive number');
    }
  }

  if (params.concurrency !== undefined) {
    if (typeof params.concurrency !== 'number' || params.concurrency <= 0) {
      errors.push('concurrency must be a positive number');
    }
  }

  if (params.total !== undefined) {
    if (typeof params.total !== 'number' || params.total < 0) {
      errors.push('total must be a non-negative number');
    }
  }

  if (params.paginationType !== undefined) {
    const validTypes = Object.values(PAGINATION_TYPES);
    if (!validTypes.includes(params.paginationType)) {
      errors.push(`paginationType must be one of: ${validTypes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate estimated time for batch completion
 *
 * @param {number} total - Total items to fetch
 * @param {number} batchSize - Items per batch
 * @param {number} concurrency - Number of parallel requests
 * @param {number} avgRequestTime - Average request time in ms (default: 1000ms)
 * @returns {number} Estimated time in milliseconds
 */
export const estimateBatchTime = (
  total,
  batchSize,
  concurrency,
  avgRequestTime = 1000,
) => {
  const pages = calculateBatchPages(total, batchSize);
  if (pages === 0) return 0;

  // First page is sequential
  // Remaining pages are batched with concurrency
  const remainingPages = Math.max(0, pages - 1);
  const batchedRounds = Math.ceil(remainingPages / concurrency);

  return avgRequestTime * (1 + batchedRounds);
};

export default {
  PAGINATION_TYPES,
  calculateBatchPages,
  createBatchParams,
  pageToOffset,
  offsetToPage,
  extractPaginationMeta,
  normalizeBatchResponse,
  mergeBatchResponses,
  validateBatchParams,
  estimateBatchTime,
};
