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
              options,
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

const fetchStatusID = async () => {
  return await fetch('/api/crc-pdf-generator/v2/create', {
    method: 'POST',
    headers: {
      // do not forget the content type header!
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      payload: [
        {
          manifestLocation: '/apps/landing/fed-mods.json',
          scope: 'landing',
          module: './PdfEntry',
        },
        {
          manifestLocation: '/apps/landing/fed-mods.json',
          scope: 'landing',
          module: './PdfEntry',
        },
      ],
    }),
  }).then(async (response) => {
    const res = await response.json();
    return res.statusID;
  });
};

export { AxiosBaseQuery, Get, Post, Put, DeleteApi, fetchStatusID };
