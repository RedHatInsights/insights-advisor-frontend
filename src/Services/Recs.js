import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Recs = createApi({
  reducerPath: 'recs',
  baseQuery: AxiosBaseQuery({ baseUrl: BASE_URL }),
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getRecs: build.query({
      query: (options) => ({
        url: `/rule/`,
        urlOverride: options?.customUrl,
        options,
      }),
    }),
    getRec: build.query({
      query: (options) => {
        const ruleId = encodeURI(options.ruleId);
        return {
          url: `/rule/${ruleId}/`,
          urlOverride: options?.customUrl,
          options: { ...options, ruleId },
        };
      },
    }),
    getRecSystems: build.query({
      query: (options, search) => ({
        url: `/rule/${encodeURI(options.ruleId)}/systems/`,
        urlOverride: options?.customUrl,
        options,
        search,
      }),
    }),
  }),
});

export const { useGetRecsQuery, useGetRecQuery, useGetRecsystemsQuery } = Recs;
