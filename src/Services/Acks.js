import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { BASE_URL } from '../AppConstants';

export const Acks = createApi({
  reducerPath: 'acks',
  baseQuery: createAdvisorBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getRecAcks: build.query({
      query: (options) => ({
        url: `/ack/${encodeURI(options.ruleId)}/`,
        customBasePath: options.customBasePath || undefined,
      }),
    }),
    getHostAcks: build.query({
      query: (options) => {
        const { customBasePath, ...otherOptions } = options;
        return {
          url: `/hostack/`,
          options: otherOptions,
          customBasePath: customBasePath || undefined,
        };
      },
      transformResponse: (response) => response.data,
    }),
    setAck: build.mutation({
      query: (options) => ({
        url: `${options.type === 'RULE' ? '/ack/' : '/hostack/'}`,
        options: options.options,
        method: 'post',
        customBasePath: options.customBasePath || undefined,
        headers:
          (options.csrfToken && { 'X-CSRF-Token': options.csrfToken }) || {},
      }),
    }),
  }),
});

export const { useGetRecAcksQuery, useGetHostAcksQuery, useSetAckMutation } =
  Acks;
