import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { BASE_URL } from '../AppConstants';
import axios from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { fetchTopics, fetchTopic } from './apiClient';

export const Topics = createApi({
  reducerPath: 'topics',
  baseQuery: createAdvisorBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getTopics: build.query({
      queryFn: async (options) => {
        try {
          const data = await fetchTopics(axios, options);
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getTopicsAdmin: build.query({
      queryFn: async (options) => {
        try {
          const data = await fetchTopics(axios, {
            ...options,
            show_disabled: true,
          });
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getTopic: build.query({
      queryFn: async (options) => {
        try {
          const data = await fetchTopic(axios, options.topicId, options);
          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const { useGetTopicsQuery, useGetTopicQuery, useGetTopicsAdminQuery } =
  Topics;
