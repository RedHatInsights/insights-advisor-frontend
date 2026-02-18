import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { BASE_URL } from '../AppConstants';

export const Topics = createApi({
  reducerPath: 'topics',
  baseQuery: createAdvisorBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getTopics: build.query({
      query: (options) => ({ url: `/topic/`, options }),
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
