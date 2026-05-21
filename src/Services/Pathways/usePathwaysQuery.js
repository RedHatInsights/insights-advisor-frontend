import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { useQueryWithUtilities } from 'bastilian-tabletools';
import { fetchPathways } from './apiClient';
import { combineParamsWithTableState } from '../../Utilities/combineParamsWithTableState';

/**
 * Hook to fetch pathways data with automatic table state integration
 * @param {object} options - Query options
 * @param {boolean} options.useTableState - If true, automatically syncs with table state (pagination, sort, filters)
 * @param {boolean} options.enabled - If false, query is disabled
 * @param {object} options.additionalParams - Additional params to merge (tags, workloads, etc.)
 * @returns {object} - useQueryWithUtilities result (items function, loading, error, etc.)
 */
export const usePathwaysQuery = ({
  useTableState = false,
  enabled = true,
  additionalParams = {},
} = {}) => {
  const fetchFn = useDeepCompareCallback(async (params) => {
    const data = await fetchPathways(params);
    return data;
  }, []);

  const queryOptions = useDeepCompareMemo(
    () => ({
      queryKey: ['pathways'],
      enabled,
      useTableState,
      fetchFn,
      params: additionalParams,
      combineParamsWithTableState,
    }),
    [enabled, useTableState, fetchFn, additionalParams],
  );

  return useQueryWithUtilities(queryOptions);
};
