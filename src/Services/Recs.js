import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicRecsBaseQuery } from '../Utilities/Api';

export const Recs = createApi({
  reducerPath: 'recs',
  baseQuery: dynamicRecsBaseQuery,
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getRecs: build.query({
      query: (options) => ({
        url: `/rule/`,
        ...options,
      }),
    }),
    getRec: build.query({
      query: (options) => {
        const ruleId = encodeURI(options.ruleId);
        return {
          url: `/rule/${ruleId}/`,
          ...options,
          ruleId,
        };
      },
    }),
    getRecSystems: build.query({
      query: (options) => ({
        url: `/rule/${encodeURI(options.ruleId)}/systems/`,
        ...options,
      }),
    }),
  }),
});

export const { useGetRecsQuery, useGetRecQuery, useGetRecsystemsQuery } = Recs;
