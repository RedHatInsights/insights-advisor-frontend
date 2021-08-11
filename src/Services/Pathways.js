import * as AppConst from '../AppConstants';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const Pathways = createApi({
  reducerPath: 'pathways',
  baseQuery: fetchBaseQuery({ baseUrl: AppConst.BASE_URL }),
  endpoints: (build) => ({
    getPathways: build.query({ query: () => `pathway` }),
    getPathway: build.query({ query: (name) => `pathway/${name}/` }),
    getPathwayRules: build.query({ query: (name) => `pathway/${name}/rules/` }),
    getPathwaySystems: build.query({
      query: (name) => `pathway/${name}/systems/`,
    }),
  }),
});

export const {
  useGetPathwaysQuery,
  useLazyGetPathwaysQuery,
  useGetPathwayQuery,
  useLazyGetPathwayQuery,
  useGetPathwayRulesQuery,
  useGetPathwaySystemsQuery,
} = Pathways;
