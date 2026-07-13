import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL, IOP_ENVIRONMENT_CONTEXT } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

const dynamicRecsBaseQuery = async (args, api, extraOptions) => {
  const customBasePath =
    args?.options?.customBasePath || IOP_ENVIRONMENT_CONTEXT.BASE_URL;
  const baseQuery = AxiosBaseQuery({ baseUrl: customBasePath });
  return baseQuery(args, api, extraOptions);
};

export const Pathways = createApi({
  reducerPath: 'pathways',
  baseQuery: dynamicRecsBaseQuery,
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getPathways: build.query({
      query: (options) => ({ url: `/pathway/`, options }),
    }),
    getPathway: build.query({
      query: (options) => ({ url: `/pathway/${options.slug}/`, options }),
    }),
    getPathwayRules: build.query({
      query: (name) => ({ url: `/pathway/${name}/rules/` }),
    }),
    getPathwaySystems: build.query({
      query: (name) => ({ url: `/pathway/${name}/systems/` }),
    }),
  }),
});

export const {
  useGetPathwaysQuery,
  useGetPathwayQuery,
  useGetPathwayRulesQuery,
  useGetPathwaySystemsQuery,
} = Pathways;
