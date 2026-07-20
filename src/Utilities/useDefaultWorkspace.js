import { useState, useEffect } from 'react';
import { fetchDefaultWorkspace } from '@project-kessel/react-kessel-access-check';

let defaultWorkspacePromise = null;

export const resetDefaultWorkspaceCache = () => {
  defaultWorkspacePromise = null;
};

export const useDefaultWorkspace = () => {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!defaultWorkspacePromise) {
      defaultWorkspacePromise = fetchDefaultWorkspace(baseUrl);
    }

    defaultWorkspacePromise
      .then((workspace) => {
        setWorkspaceId(workspace?.id ?? null);
        setError(null);
      })
      .catch((err) => {
        resetDefaultWorkspaceCache();
        console.error('Failed to fetch default workspace:', err);
        setError(err);
        setWorkspaceId(null);
      })
      .finally(() => setIsLoading(false));
  }, [baseUrl]);

  return { workspaceId, isLoading, error };
};
