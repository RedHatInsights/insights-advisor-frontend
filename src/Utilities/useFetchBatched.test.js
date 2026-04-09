import { renderHook, act } from '@testing-library/react';
import useFetchBatched from './useFetchBatched';
import { PAGINATION_TYPES } from './batchPaginationHelpers';

// Mock p-all to control concurrency behavior
jest.mock('p-all', () => {
  return jest.fn((tasks) => {
    return Promise.all(tasks.map((task) => task()));
  });
});

describe('useFetchBatched', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFetchBatched());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.progress).toEqual({
        current: 0,
        total: 0,
        percentage: 0,
      });
      expect(typeof result.current.fetchBatched).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('fetchBatched - single page', () => {
    it('should fetch single page without batching', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }],
        meta: { count: 2, offset: 0, limit: 50 },
      });

      const { result } = renderHook(() => useFetchBatched());

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          queryParams: { filter: 'active' },
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 50,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalledTimes(1);
      expect(mockFetchFunction).toHaveBeenCalledWith({
        filter: 'active',
        offset: 0,
        limit: 50,
      });

      expect(response.data).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress.percentage).toBe(100);
    });
  });

  describe('fetchBatched - multiple pages', () => {
    it('should batch multiple pages with offset pagination', async () => {
      const mockFetchFunction = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          meta: { count: 5, offset: 0, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          meta: { count: 5, offset: 2, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 5 }],
          meta: { count: 5, offset: 4, limit: 2 },
        });

      const { result } = renderHook(() => useFetchBatched());

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          queryParams: {},
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 2,
          concurrency: 2,
          autoBatch: false,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalledTimes(3);

      // Verify all pages were requested
      expect(mockFetchFunction).toHaveBeenNthCalledWith(1, {
        offset: 0,
        limit: 2,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(2, {
        offset: 2,
        limit: 2,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(3, {
        offset: 4,
        limit: 2,
      });

      // Verify merged result
      expect(response.data).toHaveLength(5);
      expect(response.data.map((d) => d.id)).toEqual([1, 2, 3, 4, 5]);
      expect(response.meta.count).toBe(5);
    });

    it('should batch multiple pages with page pagination', async () => {
      const mockFetchFunction = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          meta: { count: 5, page: 1, per_page: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          meta: { count: 5, page: 2, per_page: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 5 }],
          meta: { count: 5, page: 3, per_page: 2 },
        });

      const { result } = renderHook(() => useFetchBatched());

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          queryParams: {},
          paginationType: PAGINATION_TYPES.PAGE,
          batchSize: 2,
          autoBatch: false,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalledTimes(3);

      // Verify page-based pagination
      expect(mockFetchFunction).toHaveBeenNthCalledWith(1, {
        page: 1,
        per_page: 2,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(2, {
        page: 2,
        per_page: 2,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(3, {
        page: 3,
        per_page: 2,
      });

      expect(response.data).toHaveLength(5);
    });
  });

  describe('progress tracking', () => {
    it('should update progress during batching', async () => {
      const mockFetchFunction = jest.fn((params) => {
        return Promise.resolve({
          data: [{ id: 1 }],
          meta: { count: 10, ...params },
        });
      });

      // First call returns total of 10, batchSize of 5 = 2 pages
      mockFetchFunction.mockResolvedValueOnce({
        data: [{ id: 1 }],
        meta: { count: 10, offset: 0, limit: 5 },
      });

      const onProgress = jest.fn();
      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 5,
          onProgress,
          autoBatch: false,
        });
      });

      // Should have progress updates
      expect(onProgress).toHaveBeenCalled();
      expect(result.current.progress.total).toBe(2);
      expect(result.current.progress.percentage).toBe(100);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      const mockError = new Error('Network error');
      const mockFetchFunction = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await expect(
          result.current.fetchBatched({
            fetchFunction: mockFetchFunction,
            paginationType: PAGINATION_TYPES.OFFSET,
          }),
        ).rejects.toThrow('Network error');
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.isLoading).toBe(false);
    });

    it('should throw error if fetchFunction is missing', async () => {
      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await expect(
          result.current.fetchBatched({
            paginationType: PAGINATION_TYPES.OFFSET,
          }),
        ).rejects.toThrow('fetchFunction is required');
      });
    });

    it('should throw error for invalid parameters', async () => {
      const mockFetchFunction = jest.fn();
      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await expect(
          result.current.fetchBatched({
            fetchFunction: mockFetchFunction,
            batchSize: -1, // Invalid
          }),
        ).rejects.toThrow('Invalid batch parameters');
      });
    });
  });

  describe('auto-batching', () => {
    it('should skip batching if total is below threshold', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 10, offset: 0, limit: 50 }, // Total of 10, below MIN_BATCH_THRESHOLD
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          batchSize: 50,
          autoBatch: true, // Auto-batch enabled
        });
      });

      // Should only make one request since total < MIN_BATCH_THRESHOLD
      expect(mockFetchFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('query params preservation', () => {
    it('should preserve query params across all batch requests', async () => {
      const mockFetchFunction = jest
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

      const { result } = renderHook(() => useFetchBatched());

      const queryParams = { filter: 'active', sort: 'name', tags: ['tag1'] };

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          queryParams,
          batchSize: 1,
          paginationType: PAGINATION_TYPES.OFFSET,
          autoBatch: false,
        });
      });

      // Verify all requests included the query params
      expect(mockFetchFunction).toHaveBeenNthCalledWith(1, {
        ...queryParams,
        offset: 0,
        limit: 1,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(2, {
        ...queryParams,
        offset: 1,
        limit: 1,
      });
      expect(mockFetchFunction).toHaveBeenNthCalledWith(3, {
        ...queryParams,
        offset: 2,
        limit: 1,
      });
    });
  });

  describe('reset functionality', () => {
    it('should reset state', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
        });
      });

      expect(result.current.data).not.toBe(null);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toEqual({
        current: 0,
        total: 0,
        percentage: 0,
      });
    });
  });

  describe('warnings', () => {
    it('should warn for large datasets', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [],
        meta: { count: 6000, offset: 0, limit: 50 }, // Above BATCH_WARNING_THRESHOLD
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          batchSize: 50,
        });
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Large dataset detected'),
      );
    });

    it('should warn for datasets exceeding maximum', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [],
        meta: { count: 15000, offset: 0, limit: 50 }, // Above MAX_BATCH_TOTAL
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          batchSize: 50,
        });
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum batch total'),
      );
    });
  });

  describe('endpoint-specific configuration', () => {
    it('should use endpoint-specific defaults', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 100 },
      });

      const { result } = renderHook(() =>
        useFetchBatched({ endpoint: 'systems' }),
      );

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalledWith({
        offset: 0,
        limit: 100,
      });
    });
  });

  describe('component unmount behavior', () => {
    it('should handle unmount during active batching', async () => {
      const mockFetchFunction = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

      const { result, unmount } = renderHook(() => useFetchBatched());

      act(() => {
        result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 50,
        });
      });

      unmount();

      expect(result.current.isLoading).toBe(true);
    });

    it('should reset state correctly after unmount', () => {
      const { result, unmount } = renderHook(() => useFetchBatched());

      unmount();

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('concurrency control', () => {
    it('should accept concurrency parameter', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 50,
          concurrency: 2,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalled();
    });

    it('should handle multiple pages with concurrency setting', async () => {
      const mockFetchFunction = jest
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

      const { result } = renderHook(() => useFetchBatched());

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 1,
          concurrency: 1,
          autoBatch: false,
        });
      });

      expect(mockFetchFunction).toHaveBeenCalledTimes(3);
      expect(response.data).toHaveLength(3);
    });
  });

  describe('partial batch failures', () => {
    it('should fail entire batch if any request fails', async () => {
      const mockFetchFunction = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 3, offset: 0, limit: 1 },
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: [{ id: 3 }],
          meta: { count: 3, offset: 2, limit: 1 },
        });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await expect(
          result.current.fetchBatched({
            fetchFunction: mockFetchFunction,
            paginationType: PAGINATION_TYPES.OFFSET,
            batchSize: 1,
            autoBatch: false,
          }),
        ).rejects.toThrow('Network error');
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should provide partial data context on failure', async () => {
      const mockFetchFunction = jest
        .fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          meta: { count: 5, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 2 }],
          meta: { count: 5, offset: 1, limit: 1 },
        })
        .mockRejectedValueOnce(new Error('Failed on third request'));

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await expect(
          result.current.fetchBatched({
            fetchFunction: mockFetchFunction,
            paginationType: PAGINATION_TYPES.OFFSET,
            batchSize: 1,
            autoBatch: false,
          }),
        ).rejects.toThrow('Failed on third request');
      });

      expect(result.current.error.message).toContain('third request');
    });
  });

  describe('large dataset handling', () => {
    it('should warn for datasets exceeding maximum threshold', async () => {
      const mockFetchFunction = jest.fn().mockResolvedValue({
        data: Array(50).fill({ id: 1 }),
        meta: { count: 10001, offset: 0, limit: 50 },
      });

      const { result } = renderHook(() => useFetchBatched());

      await act(async () => {
        await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 50,
        });
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum batch total'),
      );
    });

    it('should efficiently merge large result sets', async () => {
      const batch1 = Array(100)
        .fill(null)
        .map((_, i) => ({ id: i }));
      const batch2 = Array(100)
        .fill(null)
        .map((_, i) => ({ id: i + 100 }));

      const mockFetchFunction = jest
        .fn()
        .mockResolvedValueOnce({
          data: batch1,
          meta: { count: 200, offset: 0, limit: 100 },
        })
        .mockResolvedValueOnce({
          data: batch2,
          meta: { count: 200, offset: 100, limit: 100 },
        });

      const { result } = renderHook(() => useFetchBatched());

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          fetchFunction: mockFetchFunction,
          paginationType: PAGINATION_TYPES.OFFSET,
          batchSize: 100,
          autoBatch: false,
        });
      });

      expect(response.data).toHaveLength(200);
      expect(response.data[0].id).toBe(0);
      expect(response.data[199].id).toBe(199);
    });
  });
});
