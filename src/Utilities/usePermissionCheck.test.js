import { renderHook } from '@testing-library/react';
import { useRbacV1Permissions, useKesselPermissions } from './usePermissionCheck';
import * as Hooks from './Hooks';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

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
    });

    it('should return correct Kessel permissions when all granted', () => {
      useSelfAccessCheck.mockReturnValue({
        isAllowed: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([true, true, true, false]);
    });

    it('should return correct Kessel permissions when all denied', () => {
      useSelfAccessCheck.mockReturnValue({
        isAllowed: false,
        isLoading: false,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current).toEqual([false, false, false, false]);
    });

    it('should handle loading state', () => {
      useSelfAccessCheck.mockReturnValue({
        isAllowed: false,
        isLoading: true,
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current[3]).toBe(true); // isLoading should be true
    });

    it('should handle mixed loading states', () => {
      let callCount = 0;
      useSelfAccessCheck.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { isAllowed: true, isLoading: false };
        } else if (callCount === 2) {
          return { isAllowed: false, isLoading: true }; // One is loading
        } else {
          return { isAllowed: true, isLoading: false };
        }
      });

      const { result } = renderHook(() => useKesselPermissions());

      expect(result.current[3]).toBe(true); // isLoading should be true if any is loading
    });

    it('should call useSelfAccessCheck with correct Kessel relations', () => {
      useSelfAccessCheck.mockReturnValue({
        isAllowed: true,
        isLoading: false,
      });

      renderHook(() => useKesselPermissions());

      expect(useSelfAccessCheck).toHaveBeenCalledWith({
        resourceType: 'advisor',
        relation: 'advisor_exports_view',
      });

      expect(useSelfAccessCheck).toHaveBeenCalledWith({
        resourceType: 'advisor',
        relation: 'advisor_disable_recommendations_edit',
      });

      expect(useSelfAccessCheck).toHaveBeenCalledWith({
        resourceType: 'advisor',
        relation: 'advisor_recommendation_results_view',
      });
    });
  });
});
