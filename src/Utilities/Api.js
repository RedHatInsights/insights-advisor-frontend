import Qs from 'qs';
import axios from 'axios';

const Get = (url, headers = {}, params = {}) =>
  axios.get(url, {
    headers,
    params,
    paramsSerializer(params) {
      return Qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

const Post = (url, headers = {}, data = {}) =>
  axios.post(url, data, {
    headers,
  });

const Put = (url, data = {}, headers = {}) => {
  return axios.put(url, data, {
    headers,
  });
};

const DeleteApi = (url, data = {}, headers = {}) => {
  return axios.delete(url, data, {
    headers,
  });
};

const AxiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, headers, options, search, method }) => {
    method === undefined && (method = 'get');
    try {
      const result =
        method === 'get'
          ? await Get(
              `${baseUrl}${url}?${search ? `${search}` : ``}`,
              headers,
              options
            )
          : Post(`${baseUrl}${url}`, headers, options);

      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: { status: err.response?.status, data: err.response?.data },
      };
    }
  };

export { AxiosBaseQuery, Get, Post, Put, DeleteApi };
