import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import Qs from 'qs';

export const createAdvisorBaseQuery = ({
  baseUrl: defaultBaseUrl = '',
} = {}) => {
  return async (args) => {
    const processedArgs = typeof args === 'object' && args !== null ? args : {};
    const {
      url: argUrl,
      headers: argHeaders,
      options: argOptions,
      search: argSearch,
      method: argMethod = 'get',
      customBasePath: argCustomBasePath,
      inventoryBasePath: argInventoryBasePath,
      data,
      params,
      ...remainingParams
    } = processedArgs;

    const baseUrlToUse =
      argCustomBasePath || argInventoryBasePath || defaultBaseUrl;

    const [urlPath, existingQueryString] = (argUrl || '').split('?', 2);
    const allParams = new URLSearchParams(existingQueryString);

    if (argSearch) {
      new URLSearchParams(argSearch).forEach((value, key) => {
        allParams.set(key, value);
      });
    }

    if (Object.keys(remainingParams).length > 0) {
      new URLSearchParams(remainingParams).forEach((value, key) => {
        allParams.set(key, value);
      });
    }

    const finalSearchString = allParams.toString();
    const fullUrl = `${baseUrlToUse}${urlPath}${finalSearchString ? `?${finalSearchString}` : ''}`;

    try {
      const result = await instance({
        url: fullUrl,
        method: argMethod,
        data: data || argOptions,
        params: params || argOptions,
        headers: argHeaders,
        paramsSerializer: (params) =>
          Qs.stringify(params, { arrayFormat: 'repeat' }),
      });

      return { data: result };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
        },
      };
    }
  };
};
