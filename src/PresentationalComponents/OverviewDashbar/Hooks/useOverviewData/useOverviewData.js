import { useState, useEffect, useCallback } from 'react';
import { dataFetch } from '../../../../Services/Overview';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });
  const axios = useAxiosWithPlatformInterceptors();

  const fetchData = useCallback(async () => {
    const responseDataWithInfo = await dataFetch(envContext, axios);
    setData(responseDataWithInfo);
  }, [envContext, axios]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, refetch: fetchData };
}

export default useOverviewData;
