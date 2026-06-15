import { useMemo, useEffect } from 'react';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as insightsApi from '@redhat-cloud-services/insights-client';

/**
 * Hook to get an Advisor javascript-client or specific endpoint function
 *
 * @param   {string}          [endpoint] String of the javascript-clients export for the needed endpoint
 *
 * @returns {object|Function}            Advisor javascript-client or specific endpoint function
 *
 * @category Advisor
 * @subcategory Hooks
 *
 * @example
 * // Get full API instance
 * const api = useAdvisorApi();
 * await api.pathway({ limit: 100 });
 *
 * @example
 * // Get specific endpoint
 * const pathwayEndpoint = useAdvisorApi('pathway');
 * await pathwayEndpoint({ limit: 100 });
 */
const useAdvisorApi = (endpoint) => {
  const axios = useAxiosWithPlatformInterceptors();

  const apiEndpoint = useMemo(() => {
    // insights-client has full paths hardcoded (e.g., "/api/insights/v1/pathway/")
    // BaseAPI concatenates: (this.basePath || basePath) + path
    // We need basePath to resolve to empty string in concatenation
    // Passing window.location.origin as a hack since paths are absolute
    const apiInstance = APIFactory(window.location.origin, insightsApi, {
      axios,
    });
    return endpoint ? apiInstance[endpoint] : apiInstance;
  }, [axios, endpoint]);

  useEffect(() => {
    if (endpoint && !apiEndpoint) {
      console.warn('Available endpoints:', Object.keys(insightsApi));
      throw new Error(`Endpoint ${endpoint} does not exist!`);
    }
  }, [endpoint, apiEndpoint]);

  return apiEndpoint;
};

export default useAdvisorApi;
