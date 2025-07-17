import { useState, useEffect } from 'react';
import { dataFetch } from '../../../../Services/Overview';

function useOverviewData(envContext) {
  const [data, setData] = useState({ loaded: false, isError: false });

  useEffect(() => {
    (async () => {
      const responseDataWithInfo = await dataFetch(envContext);
      setData(responseDataWithInfo);
    })();
  }, []);

  return { data, setData };
}

export default useOverviewData;
