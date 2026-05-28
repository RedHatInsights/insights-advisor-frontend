import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { useQueryWithUtilities } from 'bastilian-tabletools';
import { fetchRecs } from './apiClient';
import { combineParamsWithTableState } from '../../Utilities/combineParamsWithTableState';

export const useRecsQuery = ({
  useTableState = false,
  enabled = true,
  additionalParams = {},
} = {}) => {
  const fetchFn = useDeepCompareCallback(async (params) => {
    const data = await fetchRecs(params);
    return data;
  }, []);

  const queryOptions = useDeepCompareMemo(
    () => ({
      queryKey: ['recommendations'],
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
