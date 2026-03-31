import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import * as WorkspaceModule from './useKesselWorkspaceIds';

jest.mock('axios');

describe('useKesselWorkspaceIds', () => {
  const mockBaseUrl = 'http://localhost';

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { origin: mockBaseUrl };
  });

  describe('fetchAllWorkspaces', () => {
    it('should fetch all workspaces from a single page', async () => {
      const mockWorkspaces = [
        { id: 'workspace-1', name: 'Workspace 1' },
        { id: 'workspace-2', name: 'Workspace 2' },
      ];

      axios.get.mockResolvedValueOnce({
        data: {
          data: mockWorkspaces,
          meta: { count: 2 },
        },
      });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toEqual(mockWorkspaces);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/rbac/v2/workspaces/`,
        { params: { limit: 1000, offset: 0 } },
      );
    });

    it('should handle multiple pages of workspaces', async () => {
      const page1 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i}`,
        name: `Workspace ${i}`,
      }));
      const page2 = Array.from({ length: 500 }, (_, i) => ({
        id: `workspace-${i + 1000}`,
        name: `Workspace ${i + 1000}`,
      }));

      axios.get
        .mockResolvedValueOnce({
          data: {
            data: page1,
            meta: { count: 1500 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: page2,
            meta: { count: 1500 },
          },
        });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toHaveLength(1500);
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        `${mockBaseUrl}/api/rbac/v2/workspaces/`,
        { params: { limit: 1000, offset: 0 } },
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        `${mockBaseUrl}/api/rbac/v2/workspaces/`,
        { params: { limit: 1000, offset: 1000 } },
      );
    });

    it('should stop pagination when page length is less than limit', async () => {
      const mockWorkspaces = Array.from({ length: 250 }, (_, i) => ({
        id: `workspace-${i}`,
        name: `Workspace ${i}`,
      }));

      axios.get.mockResolvedValueOnce({
        data: {
          data: mockWorkspaces,
          meta: { count: 250 },
        },
      });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toHaveLength(250);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty workspace list', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          data: [],
          meta: { count: 0 },
        },
      });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle missing data property', async () => {
      axios.get.mockResolvedValueOnce({
        data: { meta: { count: 0 } },
      });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle missing meta count', async () => {
      const mockWorkspaces = [{ id: 'workspace-1', name: 'Workspace 1' }];

      axios.get.mockResolvedValueOnce({
        data: {
          data: mockWorkspaces,
        },
      });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toEqual(mockWorkspaces);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error on API failure', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(
        WorkspaceModule.fetchAllWorkspaces(mockBaseUrl),
      ).rejects.toThrow('Network error');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should stop when total count is reached', async () => {
      const page1 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i}`,
      }));
      const page2 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i + 1000}`,
      }));

      axios.get
        .mockResolvedValueOnce({
          data: {
            data: page1,
            meta: { count: 1200 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: page2,
            meta: { count: 1200 },
          },
        });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toHaveLength(2000);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle three pages with exact limit match', async () => {
      const page1 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i}`,
      }));
      const page2 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i + 1000}`,
      }));
      const page3 = Array.from({ length: 1000 }, (_, i) => ({
        id: `workspace-${i + 2000}`,
      }));

      axios.get
        .mockResolvedValueOnce({
          data: { data: page1, meta: { count: 3000 } },
        })
        .mockResolvedValueOnce({
          data: { data: page2, meta: { count: 3000 } },
        })
        .mockResolvedValueOnce({
          data: { data: page3, meta: { count: 3000 } },
        });

      const result = await WorkspaceModule.fetchAllWorkspaces(mockBaseUrl);

      expect(result).toHaveLength(3000);
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('useKesselWorkspaceIds hook', () => {
    it('should return workspace IDs successfully', async () => {
      const mockWorkspaces = [
        { id: 'workspace-1', name: 'Workspace 1' },
        { id: 'workspace-2', name: 'Workspace 2' },
        { id: 'workspace-3', name: 'Workspace 3' },
      ];

      axios.get.mockResolvedValueOnce({
        data: {
          data: mockWorkspaces,
          meta: { count: 3 },
        },
      });

      const { result } = renderHook(() =>
        WorkspaceModule.useKesselWorkspaceIds(),
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.workspaceIds).toBeUndefined();
      expect(result.current.error).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.workspaceIds).toEqual([
        'workspace-1',
        'workspace-2',
        'workspace-3',
      ]);
      expect(result.current.error).toBe(false);
    });

    it('should use the same cached promise on multiple renders', async () => {
      const { result: result1 } = renderHook(() =>
        WorkspaceModule.useKesselWorkspaceIds(),
      );
      const { result: result2 } = renderHook(() =>
        WorkspaceModule.useKesselWorkspaceIds(),
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      expect(result1.current.workspaceIds).toEqual(
        result2.current.workspaceIds,
      );
      expect(result1.current.error).toBe(result2.current.error);
    });
  });
});
