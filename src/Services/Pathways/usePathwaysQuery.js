import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { useQueryWithUtilities } from 'bastilian-tabletools';
import { fetchPathways } from './apiClient';

/**
 * Hook to fetch pathways data with automatic table state integration
 * @param {object} options - Query options
 * @param {boolean} options.useTableState - If true, automatically syncs with table state (pagination, sort, filters)
 * @param {boolean} options.enabled - If false, query is disabled
 * @param {object} options.additionalParams - Additional params to merge (tags, workloads, etc.)
 * @returns {object} - { items, total, loading, error, refetch }
 */
export const usePathwaysQuery = ({
  useTableState = false,
  enabled = true,
  additionalParams = {},
} = {}) => {
  const fetchFn = useDeepCompareCallback(
    async (variables) => {
      const params = {
        ...variables,
        ...additionalParams,
      };

      const data = await fetchPathways(params);
      return data;
    },
    [additionalParams],
  );

  const queryOptions = useDeepCompareMemo(
    () => ({
      queryKey: ['pathways', additionalParams],
      enabled,
      useTableState,
      fetchFn,
    }),
    [enabled, useTableState, fetchFn, additionalParams],
  );

  const { result, loading, error, refetch } =
    useQueryWithUtilities(queryOptions);

  return {
    items: result?.data,
    total: result?.meta?.count,
    loading,
    error,
    refetch,
  };
};
