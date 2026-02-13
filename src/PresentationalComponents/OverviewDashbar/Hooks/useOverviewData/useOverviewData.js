import { useState, useEffect } from 'react';
import { dataFetch } from '../../../../Services/Overview';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });
  const axios = useAxiosWithPlatformInterceptors();

  useEffect(() => {
    (async () => {
      const responseDataWithInfo = await dataFetch(envContext, axios);
      setData(responseDataWithInfo);
    })();
  }, [envContext, axios]);

  return { data, setData };
}

export default useOverviewData;
