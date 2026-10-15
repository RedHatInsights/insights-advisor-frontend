import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useWorkspaces from './useWorkspaces';

const mockGet = jest.fn();

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => ({
      get: mockGet,
    }),
  }),
);

describe('useWorkspaces hook', () => {
  let queryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    // eslint-disable-next-line react/prop-types
    const Wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'QueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches workspaces and normalizes results', async () => {
    mockGet.mockResolvedValueOnce({
      results: [
        { id: 'ws-1', name: 'Production', host_count: 12 },
        { id: 'ws-2', name: 'Staging', host_count: 4 },
      ],
      total: 2,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGet).toHaveBeenCalledWith('/api/inventory/v1/groups', {
      params: { per_page: 100, page: 1, group_type: 'standard' },
    });

    expect(result.current.data).toEqual([
      { id: 'ws-1', label: 'Production', value: 'Production', hostCount: 12 },
      { id: 'ws-2', label: 'Staging', value: 'Staging', hostCount: 4 },
    ]);
  });

  it('paginates across multiple pages to fetch all workspaces', async () => {
    mockGet
      .mockResolvedValueOnce({
        results: [{ id: 'ws-1', name: 'Page 1 Group', host_count: 10 }],
        total: 2,
      })
      .mockResolvedValueOnce({
        results: [{ id: 'ws-2', name: 'Page 2 Group', host_count: 5 }],
        total: 2,
      });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/inventory/v1/groups', {
      params: { per_page: 100, page: 1, group_type: 'standard' },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/inventory/v1/groups', {
      params: { per_page: 100, page: 2, group_type: 'standard' },
    });

    expect(result.current.data).toEqual([
      {
        id: 'ws-1',
        label: 'Page 1 Group',
        value: 'Page 1 Group',
        hostCount: 10,
      },
      {
        id: 'ws-2',
        label: 'Page 2 Group',
        value: 'Page 2 Group',
        hostCount: 5,
      },
    ]);
  });

  it('handles response wrapped in data object', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        results: [{ id: 'ws-3', name: 'Development', host_count: 2 }],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      {
        id: 'ws-3',
        label: 'Development',
        value: 'Development',
        hostCount: 2,
      },
    ]);
  });

  it('propagates error when API fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('Network error');
  });
});
