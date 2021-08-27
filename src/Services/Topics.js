import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Topics = createApi({
  reducerPath: 'topics',
  baseQuery: AxiosBaseQuery({
    baseUrl: `${BASE_URL}`,
  }),
  endpoints: (build) => ({
    getTopics: build.query({
      query: (options) => ({ url: `/topic/`, options }),
      // transformResponse: (response) => response.data,
    }),
    getTopicsAdmin: build.query({
      query: (options) => ({ url: `/topic?show_disabled=true`, options }),
    }),
    getTopic: build.query({
      query: (options) => ({
        url: `/topic/${options.topicId}/`,
        options,
      }),
    }),
  }),
});

export const { useGetTopicsQuery, useGetTopicQuery, useGetTopicsAdminQuery } =
  Topics;
