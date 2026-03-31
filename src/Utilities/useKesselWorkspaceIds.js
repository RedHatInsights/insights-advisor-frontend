import { useState, useEffect } from 'react';
import axios from 'axios';

const RBAC_WORKSPACE_API_PATH = '/api/rbac/v2/workspaces/';
let allWorkspacesPromise = null;

export async function fetchAllWorkspaces(baseUrl) {
  const workspaces = [];
  const limit = 1000;

  for (let offset = 0; ; offset += limit) {
    const { data: body } = await axios.get(
      `${baseUrl}${RBAC_WORKSPACE_API_PATH}`,
      { params: { limit, offset } },
    );

    const page = body.data ?? [];
    workspaces.push(...page);

    const total = body.meta?.count;
    if (page.length < limit) {
      break;
    }
    if (typeof total === 'number' && workspaces.length >= total) {
      break;
    }
  }

  return workspaces;
}

export const useKesselWorkspaceIds = () => {
  const [workspaceIds, setWorkspaceIds] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!allWorkspacesPromise) {
      allWorkspacesPromise = fetchAllWorkspaces(baseUrl);
    }

    allWorkspacesPromise
      .then((workspaces) => {
        const ids = workspaces
          .map((workspace) => workspace?.id)
          .filter(Boolean);
        setWorkspaceIds(ids);
        setError(false);
      })
      .catch(() => {
        allWorkspacesPromise = null;
        setWorkspaceIds(undefined);
        setError(true);
      })
      .finally(() => setIsLoading(false));
  }, [baseUrl]);

  return {
    workspaceIds,
    isLoading,
    error,
  };
};
