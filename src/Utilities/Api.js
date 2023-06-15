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

export function fetchPDFReport(template, filters) {
  const CRC_PDF_GENERATE_API = '/api/crc-pdf-generator/v1/generate';
  const url = new URL(CRC_PDF_GENERATE_API, window.location.origin);

  return fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        service: 'advisor',
        template,
        params: {
          ...filters,
        },
      }),
    },
    50000
  ).then((response) => response.blob());
}

export { AxiosBaseQuery, Get, Post, Put, DeleteApi };
