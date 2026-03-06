import { createAdvisorBaseQuery } from './createAdvisorBaseQuery';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');

describe('createAdvisorBaseQuery', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = jest.fn();
    instance.mockImplementation(mockAxios);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a GET request with default base URL', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const result = await baseQuery({ url: '/test' });

    expect(mockAxios).toHaveBeenCalledWith({
      url: 'https://api.example.com/test',
      method: 'get',
      data: undefined,
      params: undefined,
      headers: undefined,
      paramsSerializer: expect.any(Function),
    });
    expect(result).toEqual({ data: { data: 'test-data' } });
  });

  it('should handle customBasePath override', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      customBasePath: 'https://custom.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.example.com/test',
      }),
    );
  });

  it('should handle inventoryBasePath override', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      inventoryBasePath: 'https://inventory.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://inventory.example.com/test',
      }),
    );
  });

  it('should prioritize customBasePath over inventoryBasePath', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      customBasePath: 'https://custom.example.com',
      inventoryBasePath: 'https://inventory.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.example.com/test',
      }),
    );
  });

  it('should handle POST requests with data', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'created' });

    const postData = { name: 'test' };
    await baseQuery({
      url: '/create',
      method: 'post',
      data: postData,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/create',
        method: 'post',
        data: postData,
      }),
    );
  });

  it('should handle query parameters from search string', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      search: 'limit=10&offset=0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/test?limit=10&offset=0',
      }),
    );
  });

  it('should handle query parameters from remaining params', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      limit: '10',
      offset: '0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/test?limit=10&offset=0',
      }),
    );
  });

  it('should merge existing query string with additional params', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test?existing=value',
      search: 'limit=10',
      offset: '0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('existing=value'),
      }),
    );
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('limit=10'),
      }),
    );
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('offset=0'),
      }),
    );
  });

  it('should handle custom headers', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const headers = { 'X-CSRF-Token': 'token123' };
    await baseQuery({
      url: '/test',
      headers,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers,
      }),
    );
  });

  it('defaults to GET when method is missing', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const options = { key: 'value' };
    await baseQuery({
      url: '/test',
      options,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: undefined,
        params: options,
        method: 'get',
      }),
    );
  });

  it('sends data in body for POST with options', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const options = { key: 'value' };
    await baseQuery({
      url: '/test',
      method: 'post',
      options,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: options,
        params: undefined,
        method: 'post',
      }),
    );
  });

  it('should return error object on axios error', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    const error = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    };
    mockAxios.mockRejectedValue(error);

    const result = await baseQuery({ url: '/test' });

    expect(result).toEqual({
      error: {
        status: 404,
        data: { message: 'Not found' },
      },
    });
  });

  it('should handle error without response', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    const error = new Error('Network error');
    mockAxios.mockRejectedValue(error);

    const result = await baseQuery({ url: '/test' });

    expect(result).toEqual({
      error: {
        status: undefined,
        data: undefined,
      },
    });
  });

  it('should use paramsSerializer for query params', async () => {
    const baseQuery = createAdvisorBaseQuery({
      baseUrl: 'https://api.example.com',
    });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      params: { tags: ['tag1', 'tag2'] },
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        paramsSerializer: expect.any(Function),
      }),
    );

    const call = mockAxios.mock.calls[0][0];
    const serialized = call.paramsSerializer({ tags: ['tag1', 'tag2'] });
    expect(serialized).toBe('tags=tag1&tags=tag2');
  });

  describe('HTTP request behaviors', () => {
    it('sends query parameters for GET requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const options = { limit: 20, offset: 0, sort: '-last_seen' };
      await baseQuery({
        url: '/system/',
        method: 'get',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          data: undefined,
          params: options,
        }),
      );
    });

    it('sends request body for POST requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'created' });

      const options = { justification: 'False positive', rule_id: 'test' };
      await baseQuery({
        url: '/ack/',
        method: 'post',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          data: options,
          params: undefined,
        }),
      );
    });

    it('sends request body for PUT requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'updated' });

      const options = { name: 'Updated name', enabled: true };
      await baseQuery({
        url: '/topic/slug/',
        method: 'put',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          data: options,
          params: undefined,
        }),
      );
    });

    it('sends request body for PATCH requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'patched' });

      const options = { status: 'active' };
      await baseQuery({
        url: '/resource/123',
        method: 'patch',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'patch',
          data: options,
          params: undefined,
        }),
      );
    });

    it('sends query parameters for DELETE requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'deleted' });

      const options = { force: 'true' };
      await baseQuery({
        url: '/ack/rule_123/',
        method: 'delete',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
          data: undefined,
          params: options,
        }),
      );
    });

    it('sends query parameters for HEAD requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: '' });

      const options = { check: 'exists' };
      await baseQuery({
        url: '/resource',
        method: 'head',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'head',
          data: undefined,
          params: options,
        }),
      );
    });

    it('sends query parameters for OPTIONS requests', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'options' });

      const options = { preflight: 'true' };
      await baseQuery({
        url: '/resource',
        method: 'options',
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'options',
          data: undefined,
          params: options,
        }),
      );
    });

    it('handles case-insensitive method names', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const options = { key: 'value' };

      // Test GET with different cases
      await baseQuery({ url: '/test', method: 'GET', options });
      expect(mockAxios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          params: options,
          data: undefined,
        }),
      );

      // Test POST with different cases
      await baseQuery({ url: '/test', method: 'POST', options });
      expect(mockAxios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: options,
          params: undefined,
        }),
      );

      await baseQuery({ url: '/test', method: 'PoSt', options });
      expect(mockAxios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: options,
          params: undefined,
        }),
      );
    });

    it('explicit data wins over options', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'created' });

      const explicitData = { rating: 5 };
      const options = { other: 'value' };

      await baseQuery({
        url: '/rating/',
        method: 'post',
        data: explicitData,
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          data: explicitData, // Should use explicit data, not options
          params: undefined,
        }),
      );
    });

    it('explicit params wins over options', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const explicitParams = { limit: 50 };
      const options = { limit: 20 };

      await baseQuery({
        url: '/system/',
        method: 'get',
        params: explicitParams,
        options,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          params: explicitParams, // Should use explicit params, not options
          data: undefined,
        }),
      );
    });

    it('never sends options to both data and params', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const options = { key: 'value', another: 'field' };

      await baseQuery({ url: '/test', method: 'get', options });
      let call = mockAxios.mock.calls[mockAxios.mock.calls.length - 1][0];
      expect(call.params).toEqual(options);
      expect(call.data).toBeUndefined();

      await baseQuery({ url: '/test', method: 'post', options });
      call = mockAxios.mock.calls[mockAxios.mock.calls.length - 1][0];
      expect(call.data).toEqual(options);
      expect(call.params).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined method (defaults to GET)', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const options = { key: 'value' };
      await baseQuery({ url: '/test', options });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          params: options,
          data: undefined,
        }),
      );
    });

    it('handles empty options object', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test',
        method: 'get',
        options: {},
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {},
          data: undefined,
        }),
      );
    });

    it('handles null options', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test',
        method: 'post',
        options: null,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: undefined,
          params: undefined,
        }),
      );
    });

    it('handles URLs with special characters', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test/rule-with-特殊字符',
        method: 'get',
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/test/rule-with-特殊字符',
        }),
      );
    });

    it('handles very long query parameter arrays', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const longArray = Array.from({ length: 100 }, (_, i) => `tag-${i}`);
      await baseQuery({
        url: '/test',
        params: { tags: longArray },
      });

      const call = mockAxios.mock.calls[0][0];
      const serialized = call.paramsSerializer({ tags: longArray });
      expect(serialized.split('&')).toHaveLength(100);
    });

    it('handles deeply nested objects in options', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      const deepObject = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      await baseQuery({
        url: '/test',
        method: 'post',
        options: deepObject,
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: deepObject,
        }),
      );
    });

    it('handles numeric string values in params', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test',
        params: { page: '1', limit: '20', offset: '0' },
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { page: '1', limit: '20', offset: '0' },
        }),
      );
    });

    it('handles boolean values in query params', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test',
        params: { enabled: true, disabled: false },
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { enabled: true, disabled: false },
        }),
      );
    });
  });

  describe('Error handling', () => {
    it('returns error when network fails', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const networkError = new Error('Network Error');
      mockAxios.mockRejectedValue(networkError);

      const result = await baseQuery({ url: '/test' });

      expect(result).toEqual({
        error: {
          status: undefined,
          data: undefined,
        },
      });
    });

    it('returns error on timeout', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      mockAxios.mockRejectedValue(timeoutError);

      const result = await baseQuery({ url: '/test' });

      expect(result.error).toBeDefined();
      expect(result.error.status).toBeUndefined();
    });

    it('handles 401 unauthorized errors', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockAxios.mockRejectedValue(error);

      const result = await baseQuery({ url: '/test' });

      expect(result).toEqual({
        error: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      });
    });

    it('handles 403 forbidden errors', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };
      mockAxios.mockRejectedValue(error);

      const result = await baseQuery({ url: '/test' });

      expect(result).toEqual({
        error: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      });
    });

    it('handles 429 rate limit errors', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const error = {
        response: {
          status: 429,
          data: { message: 'Too many requests' },
        },
      };
      mockAxios.mockRejectedValue(error);

      const result = await baseQuery({ url: '/test' });

      expect(result).toEqual({
        error: {
          status: 429,
          data: { message: 'Too many requests' },
        },
      });
    });

    it('handles 503 service unavailable errors', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      const error = {
        response: {
          status: 503,
          data: { message: 'Service temporarily unavailable' },
        },
      };
      mockAxios.mockRejectedValue(error);

      const result = await baseQuery({ url: '/test' });

      expect(result).toEqual({
        error: {
          status: 503,
          data: { message: 'Service temporarily unavailable' },
        },
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('handles pagination parameters', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: { results: [], total: 100 } });

      await baseQuery({
        url: '/systems',
        params: { limit: 20, offset: 40, sort: '-last_seen' },
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { limit: 20, offset: 40, sort: '-last_seen' },
        }),
      );
    });

    it('handles filter arrays for multi-select filters', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: [] });

      await baseQuery({
        url: '/recommendations',
        params: {
          total_risk: ['4', '3'],
          category: ['1', '2'],
        },
      });

      const call = mockAxios.mock.calls[0][0];
      const serialized = call.paramsSerializer({
        total_risk: ['4', '3'],
        category: ['1', '2'],
      });

      expect(serialized).toContain('total_risk=4&total_risk=3');
      expect(serialized).toContain('category=1&category=2');
    });

    it('preserves existing query string in URL', async () => {
      const baseQuery = createAdvisorBaseQuery({
        baseUrl: 'https://api.example.com',
      });
      mockAxios.mockResolvedValue({ data: 'test' });

      await baseQuery({
        url: '/test?existing=param',
        params: { new: 'param' },
      });

      const call = mockAxios.mock.calls[0][0];
      expect(call.url).toContain('existing=param');
      expect(call.params).toEqual({ new: 'param' });
    });
  });
});
