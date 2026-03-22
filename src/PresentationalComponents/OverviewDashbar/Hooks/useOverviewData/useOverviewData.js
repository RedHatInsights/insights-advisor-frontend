import { useState, useEffect, useCallback } from 'react';
import { dataFetch } from '../../../../Services/Overview';

function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });

  const fetchData = useCallback(async () => {
    const responseDataWithInfo = await dataFetch(envContext);
    setData(responseDataWithInfo);
  }, [envContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, refetch: fetchData };
}

export default useOverviewData;
