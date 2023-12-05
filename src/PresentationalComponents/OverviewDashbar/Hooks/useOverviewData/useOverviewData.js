import { useState, useEffect } from 'react';
import { dataFetch } from '../../../../Services/Overview';

function useOverviewData() {
  const [data, setData] = useState({ loaded: false, isError: false });

  useEffect(() => {
    (async () => {
      const responseDataWithInfo = await dataFetch();
      setData(responseDataWithInfo);
    })();
  }, []);

  return { data, setData };
}

export default useOverviewData;
