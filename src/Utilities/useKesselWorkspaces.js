import { useState, useEffect } from 'react';
import axios from 'axios';

const RBAC_API_BASE_V2 = '/api/rbac/v2';

export const useFetchDefaultWorkspaceId = () => {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${RBAC_API_BASE_V2}/workspaces/?limit=1000&type=default`,
        );
        const workspaces = response.data?.data || [];
        const defaultWorkspace = workspaces[0];
        setWorkspaceId(defaultWorkspace?.id || null);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch workspace:', err);
        setError(err);
        setWorkspaceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  return {
    workspaceId,
    isLoading,
    error,
  };
};
