import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicRecsBaseQuery } from '../Utilities/Api';

export const Topics = createApi({
  reducerPath: 'topics',
  baseQuery: dynamicRecsBaseQuery,
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
