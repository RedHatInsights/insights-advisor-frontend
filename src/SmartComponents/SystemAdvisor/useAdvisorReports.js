import { useEffect, useState } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { isAbortError } from './helpers';

const useAdvisorReports = (inventoryId, envContext, { skip = false } = {}) => {
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState([]);
  const [error, setError] = useState(null);
  const axios = useAxiosWithPlatformInterceptors();

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const abortController = new AbortController();

      try {
        setLoading(true);

        const reportsResponse = await axios.get(
          `${envContext.BASE_URL}/system/${inventoryId}/reports/`,
          {
            headers: {
              credentials: 'include',
            },
            signal: abortController.signal,
          },
        );

        const reportsFetch = Array.isArray(reportsResponse)
          ? reportsResponse
          : reportsResponse?.data || [];

        setReportsData(reportsFetch);
        setLoading(false);
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }
        setError(err);
        setLoading(false);
      }

      return () => {
        abortController.abort();
      };
    };

    fetchData();
  }, [inventoryId, envContext, axios, skip]);

  return { reportsData, loading, error };
};

export default useAdvisorReports;
