import React from 'react';
import PropTypes from 'prop-types';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useKesselWorkspaces,
  useDefaultWorkspace,
} from './useKesselWorkspaces';

// Create a test wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        cacheTime: 0, // Disable caching for test isolation
      },
    },
  });

  const QueryWrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  QueryWrapper.propTypes = {
    children: PropTypes.node,
  };
  QueryWrapper.displayName = 'QueryWrapper';
  return QueryWrapper;
};

describe('useKesselWorkspaces', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should fetch workspaces successfully', async () => {
    const mockWorkspaces = [
      { id: 'ws-1', name: 'Default Workspace', type: 'default' },
      { id: 'ws-2', name: 'Team Workspace', type: 'default' },
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockWorkspaces }),
    });

    const { result } = renderHook(() => useKesselWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockWorkspaces);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/rbac/v2/workspaces/?limit=1000&type=default',
    );
  });

  it('should handle fetch errors gracefully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useKesselWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should handle network errors', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useKesselWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe('Network error');
  });

  it('should return empty array when response has no data property', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // No 'data' property
    });

    const { result } = renderHook(() => useKesselWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('should not fetch when enabled is false', async () => {
    renderHook(() => useKesselWorkspaces({ enabled: false }), {
      wrapper: createWrapper(),
    });

    // Wait a bit to ensure no fetch happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should cache results on subsequent renders', async () => {
    const mockWorkspaces = [{ id: 'ws-1', name: 'Default' }];

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockWorkspaces }),
    });

    const { result, rerender } = renderHook(() => useKesselWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    rerender();

    // Should not fetch again (uses cache)
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockWorkspaces);
  });
});

describe('useDefaultWorkspace', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should return first workspace as default', async () => {
    const mockWorkspaces = [
      { id: 'ws-1', name: 'Default' },
      { id: 'ws-2', name: 'Other' },
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockWorkspaces }),
    });

    const { result } = renderHook(() => useDefaultWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workspaceId).toBe('ws-1');
    expect(result.current.error).toBeFalsy();
  });

  it('should return undefined when no workspaces available', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { result } = renderHook(() => useDefaultWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workspaceId).toBeUndefined();
  });

  it('should show loading state initially', () => {
    fetchSpy.mockReturnValueOnce(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useDefaultWorkspace(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.workspaceId).toBeUndefined();
  });

  it('should return error when workspace fetch fails', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Failed to fetch workspaces'));

    const { result } = renderHook(() => useDefaultWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workspaceId).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });
});
