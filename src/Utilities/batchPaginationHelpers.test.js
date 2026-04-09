import {
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
} from './batchPaginationHelpers';

describe('batchPaginationHelpers', () => {
  describe('calculateBatchPages', () => {
    it('should calculate correct number of pages', () => {
      expect(calculateBatchPages(100, 50)).toBe(2);
      expect(calculateBatchPages(150, 50)).toBe(3);
      expect(calculateBatchPages(50, 50)).toBe(1);
      expect(calculateBatchPages(1, 50)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateBatchPages(0, 50)).toBe(0);
      expect(calculateBatchPages(100, 0)).toBe(0);
      expect(calculateBatchPages(null, 50)).toBe(0);
      expect(calculateBatchPages(100, null)).toBe(0);
      expect(calculateBatchPages(-10, 50)).toBe(0);
    });

    it('should handle partial pages', () => {
      expect(calculateBatchPages(101, 50)).toBe(3);
      expect(calculateBatchPages(99, 50)).toBe(2);
    });
  });

  describe('createBatchParams', () => {
    it('should create offset-based params correctly', () => {
      const params = createBatchParams(0, 50, {}, PAGINATION_TYPES.OFFSET);
      expect(params).toEqual({ offset: 0, limit: 50 });
    });

    it('should create page-based params correctly', () => {
      const params = createBatchParams(0, 50, {}, PAGINATION_TYPES.PAGE);
      expect(params).toEqual({ page: 1, per_page: 50 });
    });

    it('should handle subsequent pages for offset', () => {
      expect(createBatchParams(1, 50, {}, PAGINATION_TYPES.OFFSET)).toEqual({
        offset: 50,
        limit: 50,
      });
      expect(createBatchParams(2, 50, {}, PAGINATION_TYPES.OFFSET)).toEqual({
        offset: 100,
        limit: 50,
      });
    });

    it('should handle subsequent pages for page-based', () => {
      expect(createBatchParams(1, 50, {}, PAGINATION_TYPES.PAGE)).toEqual({
        page: 2,
        per_page: 50,
      });
      expect(createBatchParams(2, 50, {}, PAGINATION_TYPES.PAGE)).toEqual({
        page: 3,
        per_page: 50,
      });
    });

    it('should merge base params', () => {
      const baseParams = { filter: 'active', sort: 'name' };
      const params = createBatchParams(
        0,
        50,
        baseParams,
        PAGINATION_TYPES.OFFSET,
      );
      expect(params).toEqual({
        filter: 'active',
        sort: 'name',
        offset: 0,
        limit: 50,
      });
    });

    it('should default to offset pagination', () => {
      const params = createBatchParams(0, 50);
      expect(params.offset).toBe(0);
      expect(params.limit).toBe(50);
      expect(params.page).toBeUndefined();
    });
  });

  describe('pageToOffset', () => {
    it('should convert page to offset correctly', () => {
      expect(pageToOffset(1, 50)).toEqual({ offset: 0, limit: 50 });
      expect(pageToOffset(2, 50)).toEqual({ offset: 50, limit: 50 });
      expect(pageToOffset(3, 50)).toEqual({ offset: 100, limit: 50 });
    });

    it('should handle edge cases', () => {
      expect(pageToOffset(0, 50)).toEqual({ offset: 0, limit: 50 });
      expect(pageToOffset(-1, 50)).toEqual({ offset: 0, limit: 50 });
      expect(pageToOffset(1, 0)).toEqual({ offset: 0, limit: 10 });
      expect(pageToOffset(null, 50)).toEqual({ offset: 0, limit: 50 });
    });
  });

  describe('offsetToPage', () => {
    it('should convert offset to page correctly', () => {
      expect(offsetToPage(0, 50)).toEqual({ page: 1, per_page: 50 });
      expect(offsetToPage(50, 50)).toEqual({ page: 2, per_page: 50 });
      expect(offsetToPage(100, 50)).toEqual({ page: 3, per_page: 50 });
    });

    it('should handle edge cases', () => {
      expect(offsetToPage(-10, 50)).toEqual({ page: 1, per_page: 50 });
      expect(offsetToPage(0, 0)).toEqual({ page: 1, per_page: 10 });
      expect(offsetToPage(null, 50)).toEqual({ page: 1, per_page: 50 });
    });

    it('should handle partial pages', () => {
      expect(offsetToPage(25, 50)).toEqual({ page: 1, per_page: 50 });
      expect(offsetToPage(75, 50)).toEqual({ page: 2, per_page: 50 });
    });
  });

  describe('extractPaginationMeta', () => {
    it('should extract offset-based metadata', () => {
      const response = {
        meta: {
          count: 200,
          offset: 50,
          limit: 50,
        },
      };

      const meta = extractPaginationMeta(response, PAGINATION_TYPES.OFFSET);
      expect(meta).toEqual({
        total: 200,
        offset: 50,
        limit: 50,
        page: 2,
        perPage: 50,
      });
    });

    it('should extract page-based metadata', () => {
      const response = {
        meta: {
          count: 200,
          page: 2,
          per_page: 50,
        },
      };

      const meta = extractPaginationMeta(response, PAGINATION_TYPES.PAGE);
      expect(meta).toEqual({
        total: 200,
        page: 2,
        perPage: 50,
        offset: 50,
        limit: 50,
      });
    });

    it('should handle missing meta', () => {
      const meta = extractPaginationMeta({}, PAGINATION_TYPES.OFFSET);
      expect(meta.total).toBe(0);
      expect(meta.offset).toBe(0);
    });

    it('should prefer count over total', () => {
      const response = {
        meta: {
          count: 200,
          total: 150, // Should use count
          offset: 0,
          limit: 50,
        },
      };

      const meta = extractPaginationMeta(response, PAGINATION_TYPES.OFFSET);
      expect(meta.total).toBe(200);
    });
  });

  describe('normalizeBatchResponse', () => {
    it('should normalize offset-based response', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          count: 200,
          offset: 0,
          limit: 50,
        },
      };

      const normalized = normalizeBatchResponse(
        response,
        PAGINATION_TYPES.OFFSET,
      );
      expect(normalized.data).toHaveLength(2);
      expect(normalized.meta.count).toBe(200);
      expect(normalized.meta.total).toBe(200);
    });

    it('should normalize page-based response', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          count: 200,
          page: 1,
          per_page: 50,
        },
      };

      const normalized = normalizeBatchResponse(
        response,
        PAGINATION_TYPES.PAGE,
      );
      expect(normalized.data).toHaveLength(2);
      expect(normalized.meta.count).toBe(200);
      expect(normalized.meta.page).toBe(1);
    });

    it('should handle null/undefined response', () => {
      expect(normalizeBatchResponse(null, PAGINATION_TYPES.OFFSET)).toEqual({
        data: [],
        meta: { count: 0, total: 0 },
      });
    });

    it('should preserve extra meta fields', () => {
      const response = {
        data: [],
        meta: {
          count: 100,
          offset: 0,
          limit: 50,
          customField: 'value',
          tags: ['tag1'],
        },
      };

      const normalized = normalizeBatchResponse(
        response,
        PAGINATION_TYPES.OFFSET,
      );
      expect(normalized.meta.customField).toBe('value');
      expect(normalized.meta.tags).toEqual(['tag1']);
    });
  });

  describe('mergeBatchResponses', () => {
    it('should merge multiple responses', () => {
      const responses = [
        { data: [{ id: 1 }, { id: 2 }], meta: { count: 5 } },
        { data: [{ id: 3 }, { id: 4 }], meta: { count: 5 } },
        { data: [{ id: 5 }], meta: { count: 5 } },
      ];

      const merged = mergeBatchResponses(responses);
      expect(merged.data).toHaveLength(5);
      expect(merged.data.map((d) => d.id)).toEqual([1, 2, 3, 4, 5]);
      expect(merged.meta.count).toBe(5); // Preserved from first response
    });

    it('should handle empty responses array', () => {
      const merged = mergeBatchResponses([]);
      expect(merged).toEqual({
        data: [],
        meta: { count: 0, total: 0 },
      });
    });

    it('should handle null/undefined', () => {
      const merged = mergeBatchResponses(null);
      expect(merged.data).toEqual([]);
    });

    it('should preserve first response meta when preserveFirstMeta=true', () => {
      const responses = [
        {
          data: [{ id: 1 }],
          meta: { count: 10, offset: 0, customField: 'test' },
        },
        { data: [{ id: 2 }], meta: { count: 10, offset: 1 } },
      ];

      const merged = mergeBatchResponses(responses, true);
      expect(merged.meta.count).toBe(10);
      expect(merged.meta.customField).toBe('test');
      expect(merged.data).toHaveLength(2);
    });

    it('should use actual count when preserveFirstMeta=false', () => {
      const responses = [
        { data: [{ id: 1 }], meta: { count: 10 } },
        { data: [{ id: 2 }], meta: { count: 10 } },
      ];

      const merged = mergeBatchResponses(responses, false);
      expect(merged.meta.count).toBe(2); // Actual merged data length
    });

    it('should handle responses with missing data arrays', () => {
      const responses = [
        { data: [{ id: 1 }], meta: { count: 2 } },
        { meta: { count: 2 } }, // No data array
      ];

      const merged = mergeBatchResponses(responses);
      expect(merged.data).toHaveLength(1);
    });
  });

  describe('validateBatchParams', () => {
    it('should validate valid parameters', () => {
      const result = validateBatchParams({
        batchSize: 50,
        concurrency: 2,
        total: 100,
        paginationType: 'offset',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid batchSize', () => {
      const result = validateBatchParams({ batchSize: -1 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('batchSize must be a positive number');
    });

    it('should reject invalid concurrency', () => {
      const result = validateBatchParams({ concurrency: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('concurrency must be a positive number');
    });

    it('should reject invalid total', () => {
      const result = validateBatchParams({ total: -5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('total must be a non-negative number');
    });

    it('should reject invalid paginationType', () => {
      const result = validateBatchParams({ paginationType: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('paginationType must be one of');
    });

    it('should collect multiple errors', () => {
      const result = validateBatchParams({
        batchSize: -1,
        concurrency: 0,
        total: -5,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it('should allow partial validation', () => {
      const result = validateBatchParams({ batchSize: 50 });
      expect(result.isValid).toBe(true);
    });
  });

  describe('estimateBatchTime', () => {
    it('should estimate time correctly', () => {
      // 100 items, 50 per batch = 2 pages
      // Page 1: 1000ms
      // Page 2: 1000ms (1 concurrent batch)
      // Total: 2000ms
      expect(estimateBatchTime(100, 50, 2, 1000)).toBe(2000);
    });

    it('should account for concurrency', () => {
      // 200 items, 50 per batch = 4 pages
      // Page 1: 1000ms (initial)
      // Pages 2-4: 3 remaining pages / 2 concurrency = 2 rounds
      // Total: 1000 + (2 * 1000) = 3000ms
      expect(estimateBatchTime(200, 50, 2, 1000)).toBe(3000);
    });

    it('should handle single page', () => {
      expect(estimateBatchTime(50, 50, 2, 1000)).toBe(1000);
    });

    it('should handle zero total', () => {
      expect(estimateBatchTime(0, 50, 2, 1000)).toBe(0);
    });

    it('should handle high concurrency', () => {
      // 200 items, 50 per batch = 4 pages
      // Page 1: 1000ms
      // Pages 2-4: 3 remaining / 5 concurrency = 1 round
      // Total: 2000ms
      expect(estimateBatchTime(200, 50, 5, 1000)).toBe(2000);
    });
  });
});
