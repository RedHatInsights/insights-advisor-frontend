import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { createBatchedQueryFn } from '../Utilities/createBatchQueryEndpoint';
import { PAGINATION_TYPES } from '../Utilities/batchPaginationHelpers';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = createAdvisorBaseQuery({ baseUrl: BASE_URL });

export const Pathways = createApi({
  reducerPath: 'pathways',
  baseQuery,
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
    // Batched endpoint variants
    getPathwaysBatched: build.query({
      queryFn: createBatchedQueryFn({
        baseQuery,
        buildUrl: (params) => {
          const { customBasePath, inventoryBasePath, ...restParams } = params;
          return {
            url: `/pathway/`,
            options: restParams,
            ...(customBasePath && { customBasePath }),
            ...(inventoryBasePath && { inventoryBasePath }),
          };
        },
        endpoint: 'pathways',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    }),
    getPathwaySystemsBatched: build.query({
      queryFn: createBatchedQueryFn({
        baseQuery,
        buildUrl: (params) => {
          const { name, customBasePath, inventoryBasePath, ...restParams } =
            params;
          return {
            url: `/pathway/${name}/systems/`,
            options: restParams,
            ...(customBasePath && { customBasePath }),
            ...(inventoryBasePath && { inventoryBasePath }),
          };
        },
        endpoint: 'pathways',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    }),
  }),
});

export const {
  useGetPathwaysQuery,
  useGetPathwayQuery,
  useGetPathwayRulesQuery,
  useGetPathwaySystemsQuery,
  useGetPathwaysBatchedQuery,
  useGetPathwaySystemsBatchedQuery,
  useLazyGetPathwaysBatchedQuery,
  useLazyGetPathwaySystemsBatchedQuery,
} = Pathways;
