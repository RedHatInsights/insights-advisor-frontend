import { renderHook, waitFor } from '@testing-library/react';
import { fetchDefaultWorkspace } from '@project-kessel/react-kessel-access-check';
import {
  useDefaultWorkspace,
  resetDefaultWorkspaceCache,
} from './useDefaultWorkspace';

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  fetchDefaultWorkspace: jest.fn(),
}));

describe('useDefaultWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDefaultWorkspaceCache();
    console.error = jest.fn();
  });

  it('should return the default workspace', async () => {
    const mockWorkspaceId = 'workspace-123';
    fetchDefaultWorkspace.mockResolvedValue({
      id: mockWorkspaceId,
      type: 'default',
      name: 'Default Workspace',
      created: '2024-01-01',
      modified: '2024-01-01',
    });

    const { result } = renderHook(() => useDefaultWorkspace());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workspaceId).toBe(mockWorkspaceId);
    expect(result.current.error).toBe(null);
    expect(fetchDefaultWorkspace).toHaveBeenCalledWith(window.location.origin);
  });

  it('should handle workspace fetch error', async () => {
    const mockError = {
      code: 400,
      message: 'Bad request',
      details: [],
    };
    fetchDefaultWorkspace.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDefaultWorkspace());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workspaceId).toBe(null);
    expect(result.current.error).toBe(mockError);
    expect(fetchDefaultWorkspace).toHaveBeenCalledWith(window.location.origin);
  });

  it('should handle workspace without id', async () => {
    fetchDefaultWorkspace.mockResolvedValue({
      type: 'default',
      name: 'Default Workspace',
      created: '2024-01-01',
      modified: '2024-01-01',
    });
    const { result } = renderHook(() => useDefaultWorkspace());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workspaceId).toBe(null);
    expect(result.current.error).toBe(null);
  });
});
