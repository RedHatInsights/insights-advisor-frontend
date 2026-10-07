import { useState, useEffect } from 'react';
import { fetchDefaultWorkspace } from '@project-kessel/react-kessel-access-check';

/**
 * Module-level cache of the in-flight/resolved default-workspace promise, so the
 * workspace is fetched only once and shared across all hook consumers.
 *
 *  @type {Promise<{ id: string }>|null}
 */
let defaultWorkspacePromise = null;

/**
 * Clear the cached default-workspace promise so the next `useDefaultWorkspace`
 * call re-fetches. Called on fetch failure and exposed for tests.
 *
 *  @returns {void}
 */
export const resetDefaultWorkspaceCache = () => {
  defaultWorkspacePromise = null;
};

/**
 * Resolve the current user's default workspace id, used as the resource id for
 * Kessel self-access checks. The underlying fetch is memoized at module scope
 * (see {@link resetDefaultWorkspaceCache}) so it runs once per page load.
 *
 *  @returns {{ workspaceId: (string|null), isLoading: boolean, error: (Error|null) }}
 *    Workspace id (null until resolved or on failure), loading state, and any fetch error.
 */
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
