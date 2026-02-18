import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { BASE_URL } from '../AppConstants';

export const Recs = createApi({
  reducerPath: 'recs',
  baseQuery: createAdvisorBaseQuery({ baseUrl: BASE_URL }),
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

export const { useGetRecsQuery, useGetRecQuery, useGetRecSystemsQuery } = Recs;
