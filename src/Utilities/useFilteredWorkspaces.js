import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';

/**
 * Hook to filter workspaces based on user's view permissions.
 * Uses Kessel's useSelfAccessCheck to perform bulk permission checks.
 *
 * @param {Array} workspaces - Array of workspace objects with {id, name, type}
 * @param {boolean} enabled - Whether to perform permission checks
 * @returns {Object} { filteredWorkspaces, isLoading, error }
 */
export const useFilteredWorkspaces = (workspaces = [], enabled = true) => {
  // Build resources array for bulk permission check
  const resources = useMemo(() => {
    if (!enabled || workspaces.length === 0) {
      return [];
    }

    return workspaces.map((workspace) => ({
      type: 'workspace',
      id: workspace.id,
    }));
  }, [workspaces, enabled]);

  // Perform bulk permission check for view access
  const {
    data: permissionResults,
    isLoading,
    error,
  } = useSelfAccessCheck(
    {
      relation: 'view',
      resources,
    },
    {
      enabled: enabled && resources.length > 0,
    },
  );

  // Filter workspaces to only those with view permission
  const filteredWorkspaces = useMemo(() => {
    if (!enabled) {
      return workspaces;
    }

    if (isLoading || !permissionResults) {
      return [];
    }

    return workspaces.filter((workspace, index) => {
      const result = permissionResults[index];
      return result?.allowed === true;
    });
  }, [workspaces, permissionResults, isLoading, enabled]);

  return {
    filteredWorkspaces,
    isLoading,
    error,
  };
};
