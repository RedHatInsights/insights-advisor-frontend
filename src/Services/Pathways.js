import { dynamicRecsBaseQuery } from '../Utilities/Api';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Pathways = createApi({
  reducerPath: 'pathways',
  baseQuery: dynamicRecsBaseQuery,
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getPathways: build.query({
      query: ({ customBasePath, inventoryBasePath, ...options } = {}) => ({
        url: `/pathway/`,
        options,
        customBasePath,
        inventoryBasePath,
      }),
    }),
    getPathway: build.query({
      query: ({ customBasePath, inventoryBasePath, slug, ...options } = {}) => ({
        url: `/pathway/${slug}/`,
        options,
        customBasePath,
        inventoryBasePath,
      }),
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
