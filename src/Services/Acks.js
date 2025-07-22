import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicRecsBaseQuery } from '../Utilities/Api';

export const Acks = createApi({
  reducerPath: 'acks',
  baseQuery: dynamicRecsBaseQuery,
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
