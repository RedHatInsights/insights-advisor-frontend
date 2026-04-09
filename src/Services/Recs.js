import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { createBatchedQueryFn } from '../Utilities/createBatchQueryEndpoint';
import { PAGINATION_TYPES } from '../Utilities/batchPaginationHelpers';
import { BASE_URL } from '../AppConstants';

const baseQuery = createAdvisorBaseQuery({ baseUrl: BASE_URL });

export const Recs = createApi({
  reducerPath: 'recs',
  baseQuery,
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
    // Batched endpoint variants
    getRecsBatched: build.query({
      queryFn: createBatchedQueryFn({
        baseQuery,
        buildUrl: (params) => {
          const { customBasePath, inventoryBasePath, ...restParams } = params;
          return {
            url: `/rule/`,
            options: restParams,
            ...(customBasePath && { customBasePath }),
            ...(inventoryBasePath && { inventoryBasePath }),
          };
        },
        endpoint: 'recs',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    }),
    getRecSystemsBatched: build.query({
      queryFn: createBatchedQueryFn({
        baseQuery,
        buildUrl: (params) => {
          const { ruleId, customBasePath, inventoryBasePath, ...restParams } =
            params;
          return {
            url: `/rule/${encodeURI(ruleId)}/systems/`,
            options: restParams,
            ...(customBasePath && { customBasePath }),
            ...(inventoryBasePath && { inventoryBasePath }),
          };
        },
        endpoint: 'recs',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    }),
  }),
});

export const {
  useGetRecsQuery,
  useGetRecQuery,
  useGetRecSystemsQuery,
  useGetRecsBatchedQuery,
  useGetRecSystemsBatchedQuery,
  useLazyGetRecsBatchedQuery,
  useLazyGetRecSystemsBatchedQuery,
} = Recs;
