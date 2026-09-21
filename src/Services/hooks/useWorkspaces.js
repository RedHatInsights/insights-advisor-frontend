import { useQuery } from '@tanstack/react-query';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const WORKSPACES_QUERY_KEY = 'inventory-workspaces';

/**
 * Hook to retrieve standard host groups (workspaces) from Host Inventory API.
 *
 * @param {Object} [options={}] - Optional query configuration overrides.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<{id: string, label: string, value: string, hostCount: number}>>}
 */
export const useWorkspaces = (options = {}) => {
  const axios = useAxiosWithPlatformInterceptors();

  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/inventory/v1/groups', {
          params: { per_page: 100, group_type: 'standard' },
        });
        const rawResults =
          response?.results ||
          response?.data?.results ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);
        return rawResults.map((group) => ({
          id: group.id,
          label: group.name,
          value: group.name,
          hostCount: group.host_count,
        }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch workspaces:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export default useWorkspaces;
