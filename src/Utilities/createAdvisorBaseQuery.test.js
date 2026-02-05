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
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
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
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      customBasePath: 'https://custom.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.example.com/test',
      })
    );
  });

  it('should handle inventoryBasePath override', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      inventoryBasePath: 'https://inventory.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://inventory.example.com/test',
      })
    );
  });

  it('should prioritize customBasePath over inventoryBasePath', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      customBasePath: 'https://custom.example.com',
      inventoryBasePath: 'https://inventory.example.com',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.example.com/test',
      })
    );
  });

  it('should handle POST requests with data', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
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
      })
    );
  });

  it('should handle query parameters from search string', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      search: 'limit=10&offset=0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/test?limit=10&offset=0',
      })
    );
  });

  it('should handle query parameters from remaining params', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      limit: '10',
      offset: '0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/test?limit=10&offset=0',
      })
    );
  });

  it('should merge existing query string with additional params', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test?existing=value',
      search: 'limit=10',
      offset: '0',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('existing=value'),
      })
    );
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('limit=10'),
      })
    );
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('offset=0'),
      })
    );
  });

  it('should handle custom headers', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const headers = { 'X-CSRF-Token': 'token123' };
    await baseQuery({
      url: '/test',
      headers,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers,
      })
    );
  });

  it('should handle options as data fallback', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    const options = { key: 'value' };
    await baseQuery({
      url: '/test',
      options,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: options,
        params: options,
      })
    );
  });

  it('should return error object on axios error', async () => {
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
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
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
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
    const baseQuery = createAdvisorBaseQuery({ baseUrl: 'https://api.example.com' });
    mockAxios.mockResolvedValue({ data: 'test-data' });

    await baseQuery({
      url: '/test',
      params: { tags: ['tag1', 'tag2'] },
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        paramsSerializer: expect.any(Function),
      })
    );

    const call = mockAxios.mock.calls[0][0];
    const serialized = call.paramsSerializer({ tags: ['tag1', 'tag2'] });
    expect(serialized).toBe('tags=tag1&tags=tag2');
  });
});
