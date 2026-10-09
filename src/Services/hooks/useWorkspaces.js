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
      let page = 1;
      const per_page = 100;
      let allGroups = [];
      let total = Infinity;

      while (allGroups.length < total) {
        const response = await axios.get('/api/inventory/v1/groups', {
          params: { per_page, page, group_type: 'standard' },
        });
        const rawResults =
          response?.results ||
          response?.data?.results ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        const pageTotal =
          response?.total ??
          response?.data?.total ??
          response?.count ??
          rawResults.length;

        total = pageTotal;
        allGroups = [...allGroups, ...rawResults];

        if (rawResults.length === 0 || allGroups.length >= total) {
          break;
        }
        page += 1;
      }

      return allGroups.map((group) => ({
        id: group.id,
        label: group.name,
        value: group.name,
        hostCount: group.host_count,
      }));
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export default useWorkspaces;
