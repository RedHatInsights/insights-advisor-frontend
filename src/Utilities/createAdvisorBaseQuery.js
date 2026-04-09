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
      batchMetadata,
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

    // Add batch-specific headers if this is a batch request
    let headers = argHeaders;
    if (batchMetadata) {
      headers = { ...argHeaders };
      headers['X-Batch-Request'] = 'true';
      if (batchMetadata.index !== undefined) {
        headers['X-Batch-Index'] = String(batchMetadata.index);
      }
      if (batchMetadata.total !== undefined) {
        headers['X-Batch-Total'] = String(batchMetadata.total);
      }
      if (batchMetadata.batchSize !== undefined) {
        headers['X-Batch-Size'] = String(batchMetadata.batchSize);
      }
    }

    try {
      const isGetLikeMethod = ['get', 'delete', 'head', 'options'].includes(
        argMethod.toLowerCase(),
      );
      const result = await instance({
        url: fullUrl,
        method: argMethod,
        data: data || (!isGetLikeMethod && argOptions) || undefined,
        params: params || (isGetLikeMethod && argOptions) || undefined,
        headers,
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
