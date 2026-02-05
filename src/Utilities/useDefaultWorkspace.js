import { useState, useEffect } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const useDefaultWorkspace = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const [workspaceId, setWorkspaceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setIsLoading(true);
        const data = await axios.get('/api/rbac/v2/workspaces/', {
          params: {
            limit: 1000,
            type: 'default',
          },
        });

        const defaultWorkspaceId = data?.data?.[0]?.id || null;
        setWorkspaceId(defaultWorkspaceId);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch default workspace:', err);
        setError(err);
        setWorkspaceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [axios]);

  return { workspaceId, isLoading, error };
};
