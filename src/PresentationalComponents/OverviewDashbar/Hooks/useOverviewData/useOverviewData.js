import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { dataFetch } from '../../../../Services/Overview';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { buildGlobalFilterParams } from '../../../Common/Tables';

/**
 * Hook to retrieve and refresh overview stats for Advisor, scoped to active global filters.
 *
 * @param {Object} envContext - Environment context containing STATS_OVERVIEW_FETCH_URL.
 * @returns {{ data: Object, setData: Function, refetch: Function }} Overview stats state and refresh handler.
 */
function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });
  const axios = useAxiosWithPlatformInterceptors();
  const axiosRef = useRef(axios);

  const selectedTags = useSelector(({ filters }) => filters?.selectedTags);
  const selectedGroups = useSelector(({ filters }) => filters?.selectedGroups);
  const workloads = useSelector(({ filters }) => filters?.workloads);

  useEffect(() => {
    axiosRef.current = axios;
  }, [axios]);

  const params = useMemo(
    () => buildGlobalFilterParams({ selectedTags, selectedGroups, workloads }),
    [selectedTags, selectedGroups, workloads],
  );

  const fetchData = useCallback(async () => {
    const responseDataWithInfo = await dataFetch(
      envContext,
      axiosRef.current,
      params,
    );
    setData(responseDataWithInfo);
  }, [envContext, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, refetch: fetchData };
}

export default useOverviewData;
