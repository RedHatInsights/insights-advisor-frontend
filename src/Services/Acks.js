import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Acks = createApi({
  reducerPath: 'acks',
  baseQuery: AxiosBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getRecAcks: build.query({
      query: (options) => ({ url: `/ack/${encodeURI(options.ruleId)}/` }),
    }),
    getHostAcks: build.query({
      query: (options) => ({ url: `/hostack/`, options }),
      transformResponse: (response) => response.data,
    }),
    setAck: build.mutation({
      query: (options) => ({
        url: `${options.type === 'RULE' ? '/ack/' : '/hostack/'}`,
        options: options.options,
        method: 'post',
      }),
    }),
  }),
});

export const { useGetRecAcksQuery, useGetHostAcksQuery, useSetAckMutation } =
  Acks;
