import {
  createBatchedQueryFn,
  addBatchingToEndpoint,
  createBatchedFetch,
} from './createBatchQueryEndpoint';
import { PAGINATION_TYPES } from './batchPaginationHelpers';

jest.mock('p-all', () => {
  return jest.fn((tasks) => {
    return Promise.all(tasks.map((task) => task()));
  });
});

describe('createBatchQueryEndpoint', () => {
  describe('createBatchedQueryFn', () => {
    it('should return unbatched result when batch=false', async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: {
          data: [{ id: 1 }, { id: 2 }],
          meta: { count: 2 },
        },
      });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await queryFn({ batch: false, filter: 'active' }, {}, {});

      expect(mockBaseQuery).toHaveBeenCalledTimes(1);
      expect(mockBaseQuery).toHaveBeenCalledWith(
        { url: '/api/test', options: { filter: 'active' } },
        {},
        {},
      );
      expect(result.data).toBeDefined();
    });

    it('should perform batched fetch when batch=true', async () => {
      const mockBaseQuery = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 1 }, { id: 2 }],
            meta: { count: 5, offset: 0, limit: 2 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 3 }, { id: 4 }],
            meta: { count: 5, offset: 2, limit: 2 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 5 }],
            meta: { count: 5, offset: 4, limit: 2 },
          },
        });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await queryFn(
        {
          batch: true,
          batchSize: 2,
          concurrency: 2,
          autoBatch: false,
        },
        {},
        {},
      );

      expect(mockBaseQuery).toHaveBeenCalledTimes(3);
      expect(result.data.data).toHaveLength(5);
      expect(result.data.meta.count).toBe(5);
    });

    it('should skip batching for small datasets', async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: {
          data: [{ id: 1 }],
          meta: { count: 1, offset: 0, limit: 50 },
        },
      });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await queryFn(
        {
          batch: true,
          batchSize: 50,
        },
        {},
        {},
      );

      expect(mockBaseQuery).toHaveBeenCalledTimes(1);
      expect(result.data.data).toHaveLength(1);
    });

    it('should handle errors from baseQuery', async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        error: {
          status: 500,
          data: 'Server error',
        },
      });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
      });

      const result = await queryFn({ batch: true }, {}, {});

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(500);
    });

    it('should handle errors during batch processing', async () => {
      const mockBaseQuery = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 1 }],
            meta: { count: 5, offset: 0, limit: 2 },
          },
        })
        .mockResolvedValueOnce({
          error: {
            status: 500,
            data: 'Batch failed',
          },
        });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await queryFn(
        {
          batch: true,
          batchSize: 2,
          autoBatch: false,
        },
        {},
        {},
      );

      expect(result.error).toBeDefined();
    });

    it('should include batch metadata in requests', async () => {
      const mockBaseQuery = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 1 }],
            meta: { count: 3, offset: 0, limit: 1 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 2 }],
            meta: { count: 3, offset: 1, limit: 1 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 3 }],
            meta: { count: 3, offset: 2, limit: 1 },
          },
        });

      const buildUrl = (params) => ({ url: '/api/test', options: params });

      const queryFn = createBatchedQueryFn({
        baseQuery: mockBaseQuery,
        buildUrl,
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await queryFn(
        {
          batch: true,
          batchSize: 1,
          autoBatch: false,
        },
        {},
        {},
      );

      expect(mockBaseQuery).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          batchMetadata: expect.objectContaining({
            index: 0,
            batchSize: 1,
          }),
        }),
        {},
        {},
      );

      expect(mockBaseQuery).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          batchMetadata: expect.objectContaining({
            index: 1,
            total: 3,
            batchSize: 1,
          }),
        }),
        {},
        {},
      );
    });
  });

  describe('addBatchingToEndpoint', () => {
    it('should convert query endpoint to queryFn endpoint', () => {
      const mockBaseQuery = jest.fn();
      const endpointDef = {
        query: (options) => ({ url: '/api/test', ...options }),
      };

      const enhanced = addBatchingToEndpoint(mockBaseQuery, endpointDef, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      expect(enhanced.queryFn).toBeDefined();
      expect(enhanced.query).toBeUndefined();
    });

    it('should throw error if endpoint has no query function', () => {
      const mockBaseQuery = jest.fn();
      const endpointDef = {};

      expect(() => {
        addBatchingToEndpoint(mockBaseQuery, endpointDef);
      }).toThrow('Endpoint definition must have a query function');
    });

    it('should preserve other endpoint properties', () => {
      const mockBaseQuery = jest.fn();
      const endpointDef = {
        query: (options) => ({ url: '/api/test', ...options }),
        keepUnusedDataFor: 300,
        providesTags: ['Test'],
      };

      const enhanced = addBatchingToEndpoint(mockBaseQuery, endpointDef, {
        endpoint: 'test',
      });

      expect(enhanced.keepUnusedDataFor).toBe(300);
      expect(enhanced.providesTags).toEqual(['Test']);
    });
  });

  describe('createBatchedFetch', () => {
    it('should create a batched fetch function', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 3, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 2 }],
          meta: { count: 3, offset: 1, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }],
          meta: { count: 3, offset: 2, limit: 1 },
        });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await fetchBatched(
        { filter: 'active' },
        { batchSize: 1, autoBatch: false },
      );

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.data).toHaveLength(3);
      expect(result.meta.count).toBe(3);
    });

    it('should skip batching for small datasets', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await fetchBatched({}, { batchSize: 50 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(1);
    });

    it('should preserve query parameters across batches', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 2, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 2 }],
          meta: { count: 2, offset: 1, limit: 1 },
        });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const queryParams = { filter: 'active', sort: 'name' };
      await fetchBatched(queryParams, { batchSize: 1, autoBatch: false });

      expect(mockFetch).toHaveBeenNthCalledWith(1, {
        ...queryParams,
        offset: 0,
        limit: 1,
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, {
        ...queryParams,
        offset: 1,
        limit: 1,
      });
    });

    it('should use page-based pagination when specified', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 2, page: 1, per_page: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 2 }],
          meta: { count: 2, page: 2, per_page: 1 },
        });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.PAGE,
      });

      await fetchBatched({}, { batchSize: 1, autoBatch: false });

      expect(mockFetch).toHaveBeenNthCalledWith(1, {
        page: 1,
        per_page: 1,
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, {
        page: 2,
        per_page: 1,
      });
    });

    it('should handle sequential batch operations', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 2, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 2 }],
          meta: { count: 2, offset: 1, limit: 1 },
        });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result1 = await fetchBatched(
        {},
        { batchSize: 1, autoBatch: false },
      );
      expect(result1.data).toHaveLength(2);

      mockFetch.mockClear();
      mockFetch
        .mockResolvedValueOnce({
          data: [{ id: 3 }],
          meta: { count: 2, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 4 }],
          meta: { count: 2, offset: 1, limit: 1 },
        });

      const result2 = await fetchBatched(
        {},
        { batchSize: 1, autoBatch: false },
      );
      expect(result2.data).toHaveLength(2);
      expect(result2.data[0].id).toBe(3);
    });

    it('should handle duplicate data across batches', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          data: [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ],
          meta: { count: 4, offset: 0, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ],
          meta: { count: 4, offset: 2, limit: 2 },
        });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await fetchBatched({}, { batchSize: 2, autoBatch: false });

      expect(result.data).toHaveLength(4);
      const ids = result.data.map((item) => item.id);
      expect(ids).toEqual([1, 2, 2, 3]);
    });

    it('should handle empty batch responses', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [],
        meta: { count: 0, offset: 0, limit: 50 },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await fetchBatched({});

      expect(result.data).toHaveLength(0);
      expect(result.meta.count).toBe(0);
    });

    it('should normalize missing meta in response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      const result = await fetchBatched({});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toBeDefined();
    });
  });

  describe('error recovery patterns', () => {
    it('should provide detailed error context', async () => {
      const mockFetch = jest.fn().mockRejectedValue({
        response: {
          status: 503,
          data: { message: 'Service unavailable' },
        },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await expect(fetchBatched({})).rejects.toBeTruthy();
    });

    it('should handle network timeouts', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('ETIMEDOUT'));

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await expect(fetchBatched({})).rejects.toThrow('ETIMEDOUT');
    });
  });

  describe('complex parameter scenarios', () => {
    it('should handle array parameters correctly', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await fetchBatched({ tags: ['tag1', 'tag2'], groups: ['group1'] });

      expect(mockFetch).toHaveBeenCalledWith({
        tags: ['tag1', 'tag2'],
        groups: ['group1'],
        offset: 0,
        limit: 50,
      });
    });

    it('should merge filter parameters correctly', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await fetchBatched({
        filter: { name: 'test', active: true },
        sort: '-created',
      });

      expect(mockFetch).toHaveBeenCalledWith({
        filter: { name: 'test', active: true },
        sort: '-created',
        offset: 0,
        limit: 50,
      });
    });

    it('should not override pagination params in queryParams', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 25 },
      });

      const fetchBatched = createBatchedFetch(mockFetch, {
        endpoint: 'test',
        paginationType: PAGINATION_TYPES.OFFSET,
      });

      await fetchBatched({ offset: 100, limit: 200 }, { batchSize: 25 });

      expect(mockFetch).toHaveBeenCalledWith({
        offset: 0,
        limit: 25,
      });
    });
  });
});
