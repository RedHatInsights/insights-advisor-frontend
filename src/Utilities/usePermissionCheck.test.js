import { renderHook } from '@testing-library/react';
import {
  useRbacV1Permissions,
  useKesselPermissions,
} from './usePermissionCheck';
import * as Hooks from './Hooks';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import * as useDefaultWorkspaceModule from './useDefaultWorkspace';

jest.mock('./Hooks', () => ({
  useRbac: jest.fn(),
  PERMISSIONS: {
    export: 'advisor:exports:read',
    disableRec: 'advisor:disable-recommendations:write',
    viewRecs: 'advisor:recommendation-results:read',
  },
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: jest.fn(),
}));

jest.mock('./useDefaultWorkspace', () => ({
  useDefaultWorkspace: jest.fn(),
}));

describe('usePermissionCheck', () => {
  describe('useRbacV1Permissions', () => {
    it('should return correct RBAC v1 permissions', () => {
      Hooks.useRbac.mockReturnValue([
        [true, false, true], // canExport, canDisableRec, canViewRecs
        false, // isLoading
      ]);

      const { result } = renderHook(() => useRbacV1Permissions());

      expect(result.current).toEqual([true, false, true, false]);
    });

    it('should handle loading state', () => {
      Hooks.useRbac.mockReturnValue([
        [false, false, false],
        true, // isLoading
      ]);

      const { result } = renderHook(() => useRbacV1Permissions());

      expect(result.current).toEqual([false, false, false, true]);
    });

    it('should call useRbac with correct permissions', () => {
      Hooks.useRbac.mockReturnValue([[true, true, true], false]);

      renderHook(() => useRbacV1Permissions());

      expect(Hooks.useRbac).toHaveBeenCalledWith([
        'advisor:exports:read',
        'advisor:disable-recommendations:write',
        'advisor:recommendation-results:read',
      ]);
    });
  });

  describe('useKesselPermissions', () => {
    beforeEach(() => {
      useSelfAccessCheck.mockReset();
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReset();
    });

    it('should return correct Kessel permissions when all granted', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: 'workspace-123',
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [{ allowed: true }, { allowed: true }, { allowed: true }],
        loading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([true, true, true, false]);
    });

    it('should return correct Kessel permissions when all denied', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: 'workspace-123',
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [{ allowed: false }, { allowed: false }, { allowed: false }],
        loading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([false, false, false, false]);
    });

    it('should handle loading state', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: 'workspace-123',
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [{ allowed: false }, { allowed: false }, { allowed: false }],
        loading: true,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current[3]).toBe(true);
    });

    it('should handle workspace loading state', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: null,
        isLoading: true,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [],
        loading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([false, false, false, true]);
    });

    it('should handle missing workspace ID', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: null,
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [],
        loading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([false, false, false, false]);
    });

    it('should handle mixed permissions', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: 'workspace-123',
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [{ allowed: true }, { allowed: false }, { allowed: true }],
        loading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([true, false, true, false]);
    });

    it('should call useSelfAccessCheck with correct workspace-scoped Kessel relations', () => {
      useDefaultWorkspaceModule.useDefaultWorkspace.mockReturnValue({
        workspaceId: 'workspace-123',
        isLoading: false,
        error: null,
      });

      useSelfAccessCheck.mockReturnValue({
        data: [{ allowed: true }, { allowed: true }, { allowed: true }],
        loading: false,
      });

      renderHook(() => useKesselPermissions());

      expect(useSelfAccessCheck).toHaveBeenCalledWith({
        resources: [
          {
            id: 'workspace-123',
            type: 'workspace',
            relation: 'advisor_exports_view',
            reporter: { type: 'rbac' },
          },
          {
            id: 'workspace-123',
            type: 'workspace',
            relation: 'advisor_disable_recommendations_edit',
            reporter: { type: 'rbac' },
          },
          {
            id: 'workspace-123',
            type: 'workspace',
            relation: 'advisor_recommendation_results_view',
            reporter: { type: 'rbac' },
          },
        ],
      });
    });
  });
});
