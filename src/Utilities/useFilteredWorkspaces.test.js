import { renderHook, waitFor } from '@testing-library/react';
import { useFilteredWorkspaces } from './useFilteredWorkspaces';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

jest.mock('@project-kessel/react-kessel-access-check');

describe('useFilteredWorkspaces', () => {
  const mockWorkspaces = [
    { id: 'ws-1', name: 'Default Workspace', type: 'default' },
    { id: 'ws-2', name: 'Team Workspace', type: 'default' },
    { id: 'ws-3', name: 'Restricted Workspace', type: 'default' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all workspaces when permission check succeeds for all', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }, { allowed: true }, { allowed: true }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    await waitFor(() => {
      expect(result.current.filteredWorkspaces).toHaveLength(3);
    });
    expect(result.current.filteredWorkspaces).toEqual(mockWorkspaces);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('filters out workspaces without view permission', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }, { allowed: false }, { allowed: true }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    await waitFor(() => {
      expect(result.current.filteredWorkspaces).toHaveLength(2);
    });
    expect(result.current.filteredWorkspaces).toEqual([
      mockWorkspaces[0],
      mockWorkspaces[2],
    ]);
  });

  it('returns empty array when all permissions are denied', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: false }, { allowed: false }, { allowed: false }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    await waitFor(() => {
      expect(result.current.filteredWorkspaces).toHaveLength(0);
    });
    expect(result.current.filteredWorkspaces).toEqual([]);
  });

  it('returns empty array while loading', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    expect(result.current.filteredWorkspaces).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('passes error from useSelfAccessCheck', async () => {
    const mockError = new Error('Permission check failed');
    useSelfAccessCheck.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    expect(result.current.error).toBe(mockError);
  });

  it('returns all workspaces when enabled is false', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, false),
    );

    expect(result.current.filteredWorkspaces).toEqual(mockWorkspaces);
    expect(useSelfAccessCheck).toHaveBeenCalledWith(
      { relation: 'view', resources: [] },
      { enabled: false },
    );
  });

  it('handles empty workspaces array', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFilteredWorkspaces([], true));

    expect(result.current.filteredWorkspaces).toEqual([]);
    expect(useSelfAccessCheck).toHaveBeenCalledWith(
      { relation: 'view', resources: [] },
      { enabled: false },
    );
  });

  it('calls useSelfAccessCheck with correct parameters', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }],
      isLoading: false,
      error: null,
    });

    const singleWorkspace = [mockWorkspaces[0]];
    renderHook(() => useFilteredWorkspaces(singleWorkspace, true));

    expect(useSelfAccessCheck).toHaveBeenCalledWith(
      {
        relation: 'view',
        resources: [{ type: 'workspace', id: 'ws-1' }],
      },
      { enabled: true },
    );
  });

  it('memoizes resources based on workspaces and enabled', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }],
      isLoading: false,
      error: null,
    });

    const { rerender } = renderHook(
      ({ workspaces, enabled }) => useFilteredWorkspaces(workspaces, enabled),
      {
        initialProps: { workspaces: mockWorkspaces, enabled: true },
      },
    );

    const firstCallArgs = useSelfAccessCheck.mock.calls[0];

    // Rerender with same props - should use memoized resources
    rerender({ workspaces: mockWorkspaces, enabled: true });

    const secondCallArgs = useSelfAccessCheck.mock.calls[1];
    expect(firstCallArgs[0].resources).toBe(secondCallArgs[0].resources);
  });

  it('handles partial permission results gracefully', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }, { allowed: undefined }, { allowed: null }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(mockWorkspaces, true),
    );

    await waitFor(() => {
      // Only the first workspace with explicit allowed: true should be included
      expect(result.current.filteredWorkspaces).toHaveLength(1);
    });
    expect(result.current.filteredWorkspaces).toEqual([mockWorkspaces[0]]);
  });

  it('handles workspace objects without all required fields', async () => {
    const incompleteWorkspaces = [
      { id: 'ws-1', name: 'Complete' },
      { id: 'ws-2' }, // missing name
      { name: 'No ID' }, // missing id
    ];

    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: true }, { allowed: true }, { allowed: true }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useFilteredWorkspaces(incompleteWorkspaces, true),
    );

    await waitFor(() => {
      expect(result.current.filteredWorkspaces).toHaveLength(3);
    });
  });
});
