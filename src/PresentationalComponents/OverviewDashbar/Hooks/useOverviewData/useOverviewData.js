import { useState, useEffect, useCallback, useRef } from 'react';
import { dataFetch } from '../../../../Services/Overview';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });
  const axios = useAxiosWithPlatformInterceptors();
  const axiosRef = useRef(axios);

  useEffect(() => {
    axiosRef.current = axios;
  }, [axios]);

  const fetchData = useCallback(async () => {
    const responseDataWithInfo = await dataFetch(envContext, axiosRef.current);
    setData(responseDataWithInfo);
  }, [envContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, refetch: fetchData };
}

export default useOverviewData;
