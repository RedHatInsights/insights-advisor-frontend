import { renderHook, act } from '@testing-library/react';
import useAdvisorQuery, {
  useAdvisorBatchFetch,
  createAdvisorBatchFetch,
} from './useAdvisorQuery';
import { PAGINATION_TYPES } from './batchPaginationHelpers';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');

jest.mock('p-all', () => {
  return jest.fn((tasks) => {
    return Promise.all(tasks.map((task) => task()));
  });
});

describe('useAdvisorQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.fetchBatched).toBe('function');
      expect(typeof result.current.fetchAllIds).toBe('function');
      expect(typeof result.current.exporter).toBe('function');
    });
  });

  describe('fetchBatched', () => {
    it('should fetch data with batching', async () => {
      instance
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

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
          paginationType: PAGINATION_TYPES.OFFSET,
        }),
      );

      let response;
      await act(async () => {
        response = await result.current.fetchBatched({
          batchSize: 2,
          autoBatch: false,
        });
      });

      expect(instance).toHaveBeenCalledTimes(3);
      expect(response.data).toHaveLength(5);
      expect(response.meta.count).toBe(5);
    });

    it('should merge query params', async () => {
      instance.mockResolvedValue({
        data: {
          data: [{ id: 1 }],
          meta: { count: 1, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          queryParams: { filter: 'active' },
          skip: true,
        }),
      );

      await act(async () => {
        await result.current.fetchBatched({ sort: 'name' });
      });

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            filter: 'active',
            sort: 'name',
          }),
        }),
      );
    });
  });

  describe('fetchAllIds', () => {
    it('should fetch and extract all IDs', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }, { id: 2 }],
          meta: { count: 2, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let ids;
      await act(async () => {
        ids = await result.current.fetchAllIds();
      });

      expect(ids).toEqual([1, 2]);
    });

    it('should use custom id field', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [{ uuid: 'a1' }, { uuid: 'a2' }],
          meta: { count: 2, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let ids;
      await act(async () => {
        ids = await result.current.fetchAllIds('uuid');
      });

      expect(ids).toEqual(['a1', 'a2']);
    });

    it('should filter out undefined values', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }, {}, { id: 3 }],
          meta: { count: 3, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let ids;
      await act(async () => {
        ids = await result.current.fetchAllIds();
      });

      expect(ids).toEqual([1, 3]);
    });
  });

  describe('exporter', () => {
    it('should export all data', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' },
          ],
          meta: { count: 2, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let exported;
      await act(async () => {
        exported = await result.current.exporter();
      });

      expect(exported).toHaveLength(2);
      expect(exported[0].name).toBe('Test 1');
    });

    it('should transform data if transform function provided', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [{ id: 1, name: 'Test 1' }],
          meta: { count: 1, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let exported;
      await act(async () => {
        exported = await result.current.exporter(
          {},
          {
            transform: (data) => data.map((item) => item.name),
          },
        );
      });

      expect(exported).toEqual(['Test 1']);
    });

    it('should include IDs when requested', async () => {
      instance.mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }, { id: 2 }],
          meta: { count: 2, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      let exported;
      await act(async () => {
        exported = await result.current.exporter({}, { includeIds: true });
      });

      expect(exported.data).toHaveLength(2);
      expect(exported.ids).toEqual([1, 2]);
      expect(exported.total).toBe(2);
    });
  });

  describe('refetch', () => {
    it('should refetch data', async () => {
      instance.mockResolvedValue({
        data: {
          data: [{ id: 1 }],
          meta: { count: 1, offset: 0, limit: 50 },
        },
      });

      const { result } = renderHook(() =>
        useAdvisorQuery('test', {
          baseUrl: '/api',
          url: '/test',
          skip: true,
        }),
      );

      await act(async () => {
        await result.current.fetchBatched();
      });

      expect(instance).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(instance).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useAdvisorBatchFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a batched fetch function', async () => {
    instance
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }],
          meta: { count: 2, offset: 0, limit: 1 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 2 }],
          meta: { count: 2, offset: 1, limit: 1 },
        },
      });

    const { result } = renderHook(() =>
      useAdvisorBatchFetch('test', {
        baseUrl: '/api',
        url: '/test',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    );

    let response;
    await act(async () => {
      response = await result.current.fetchBatched(
        {},
        { batchSize: 1, autoBatch: false },
      );
    });

    expect(instance).toHaveBeenCalledTimes(2);
    expect(response.data).toHaveLength(2);
  });

  it('should expose loading and error states', () => {
    const { result } = renderHook(() =>
      useAdvisorBatchFetch('test', {
        baseUrl: '/api',
        url: '/test',
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.progress).toBeDefined();
  });
});

describe('createAdvisorBatchFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a standalone batched fetch function', async () => {
    instance
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }],
          meta: { count: 2, offset: 0, limit: 1 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 2 }],
          meta: { count: 2, offset: 1, limit: 1 },
        },
      });

    const fetchBatched = createAdvisorBatchFetch('test', {
      baseUrl: '/api',
      url: '/test',
      paginationType: PAGINATION_TYPES.OFFSET,
    });

    const result = await fetchBatched({}, { batchSize: 1, autoBatch: false });

    expect(instance).toHaveBeenCalledTimes(2);
    expect(result.data).toHaveLength(2);
    expect(result.meta.count).toBe(2);
  });

  it('should work outside of React components', async () => {
    instance.mockResolvedValue({
      data: {
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      },
    });

    const fetchBatched = createAdvisorBatchFetch('test', {
      baseUrl: '/api',
      url: '/test',
    });

    const result = await fetchBatched({ filter: 'active' });

    expect(result.data).toHaveLength(1);
  });
});

describe('useAdvisorQuery - error scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network errors gracefully', async () => {
    instance.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    await act(async () => {
      await expect(result.current.fetchBatched()).rejects.toThrow(
        'Network error',
      );
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should handle 404 errors', async () => {
    instance.mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    await act(async () => {
      await expect(result.current.fetchBatched()).rejects.toBeTruthy();
    });
  });

  it('should handle 403 errors', async () => {
    instance.mockRejectedValue({
      response: { status: 403, data: { message: 'Forbidden' } },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    await act(async () => {
      await expect(result.current.fetchBatched()).rejects.toBeTruthy();
    });
  });

  it('should recover after error with refetch', async () => {
    instance
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }],
          meta: { count: 1, offset: 0, limit: 50 },
        },
      });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    await act(async () => {
      await expect(result.current.fetchBatched()).rejects.toThrow(
        'Temporary error',
      );
    });

    expect(result.current.error).toBeTruthy();

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data.data).toHaveLength(1);
    expect(result.current.error).toBe(null);
  });
});

describe('useAdvisorQuery - complex scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle very large batch sizes', async () => {
    const largeDataset = Array(1000)
      .fill(null)
      .map((_, i) => ({ id: i }));

    instance
      .mockResolvedValueOnce({
        data: {
          data: largeDataset.slice(0, 500),
          meta: { count: 1000, offset: 0, limit: 500 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: largeDataset.slice(500, 1000),
          meta: { count: 1000, offset: 500, limit: 500 },
        },
      });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    );

    let response;
    await act(async () => {
      response = await result.current.fetchBatched({
        batchSize: 500,
        autoBatch: false,
      });
    });

    expect(response.data).toHaveLength(1000);
  });

  it('should handle custom batch parameters correctly', async () => {
    instance.mockResolvedValue({
      data: {
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 25 },
      },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
        batchSize: 50,
        concurrency: 3,
      }),
    );

    await act(async () => {
      await result.current.fetchBatched({
        batchSize: 25,
        concurrency: 1,
      });
    });

    expect(instance).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          limit: 25,
        }),
      }),
    );
  });

  it('should handle progress callbacks', async () => {
    instance
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

    const onProgress = jest.fn();

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
        paginationType: PAGINATION_TYPES.OFFSET,
        onProgress,
      }),
    );

    await act(async () => {
      await result.current.fetchBatched({
        batchSize: 1,
        autoBatch: false,
      });
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('should handle page-based pagination', async () => {
    instance
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }],
          meta: { count: 2, page: 1, per_page: 1 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 2 }],
          meta: { count: 2, page: 2, per_page: 1 },
        },
      });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
        paginationType: PAGINATION_TYPES.PAGE,
      }),
    );

    await act(async () => {
      await result.current.fetchBatched({
        batchSize: 1,
        autoBatch: false,
      });
    });

    expect(instance).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        params: expect.objectContaining({ page: 1, per_page: 1 }),
      }),
    );

    expect(instance).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        params: expect.objectContaining({ page: 2, per_page: 1 }),
      }),
    );
  });

  it('should handle exporter with complex transformations', async () => {
    instance.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Test 1', status: 'active' },
          { id: 2, name: 'Test 2', status: 'inactive' },
        ],
        meta: { count: 2, offset: 0, limit: 50 },
      },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    let exported;
    await act(async () => {
      exported = await result.current.exporter(
        { filter: 'all' },
        {
          transform: (data) =>
            data
              .filter((item) => item.status === 'active')
              .map((item) => ({ id: item.id, label: item.name })),
        },
      );
    });

    expect(exported).toHaveLength(1);
    expect(exported[0]).toEqual({ id: 1, label: 'Test 1' });
  });

  it('should handle empty exporter results', async () => {
    instance.mockResolvedValue({
      data: {
        data: [],
        meta: { count: 0, offset: 0, limit: 50 },
      },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    let exported;
    await act(async () => {
      exported = await result.current.exporter();
    });

    expect(exported).toHaveLength(0);
  });

  it('should handle fetchAllIds with no results', async () => {
    instance.mockResolvedValue({
      data: {
        data: [],
        meta: { count: 0, offset: 0, limit: 50 },
      },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
      }),
    );

    let ids;
    await act(async () => {
      ids = await result.current.fetchAllIds();
    });

    expect(ids).toEqual([]);
  });

  it('should handle POST method for batch requests', async () => {
    instance.mockResolvedValue({
      data: {
        data: [{ id: 1 }],
        meta: { count: 1, offset: 0, limit: 50 },
      },
    });

    const { result } = renderHook(() =>
      useAdvisorQuery('test', {
        baseUrl: '/api',
        url: '/test',
        skip: true,
        method: 'post',
      }),
    );

    await act(async () => {
      await result.current.fetchBatched();
    });

    expect(instance).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
      }),
    );
  });
});
