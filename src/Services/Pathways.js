import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Pathways = createApi({
  reducerPath: 'pathways',
  baseQuery: AxiosBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getPathways: build.query({
      query: (options) => ({ url: `pathway/`, options }),
    }),
    getPathway: build.query({
      query: (name) => ({ url: `pathway/${name}/` }),
    }),
    getPathwayRules: build.query({
      query: (name) => ({ url: `pathway/${name}/rules/` }),
    }),
    getPathwaySystems: build.query({
      query: (name) => ({ url: `pathway/${name}/systems/` }),
    }),
  }),
});

export const {
  useGetPathwaysQuery,
  useGetPathwayQuery,
  useGetPathwayRulesQuery,
  useGetPathwaySystemsQuery,
} = Pathways;
