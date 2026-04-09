import * as AppConst from '../AppConstants';

import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { createBatchedQueryFn } from '../Utilities/createBatchQueryEndpoint';
import { PAGINATION_TYPES } from '../Utilities/batchPaginationHelpers';
import { createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = createAdvisorBaseQuery({ baseUrl: AppConst.BASE_URL });

export const Systems = createApi({
  reducerPath: 'systems',
  baseQuery,
  endpoints: (build) => ({
    getSystems: build.query({
      query: (options) => ({ url: `/system/`, options }),
    }),
    getSystem: build.query({
      query: (ruleId, options, search) => ({
        url: `/rule/${encodeURI(ruleId)}/systems/`,
        options,
        search,
      }),
    }),
    // Batched endpoint variants
    getSystemsBatched: build.query({
      queryFn: createBatchedQueryFn({
        baseQuery,
        buildUrl: (params) => {
          const { customBasePath, inventoryBasePath, ...restParams } = params;
          return {
            url: `/system/`,
            options: restParams,
            ...(customBasePath && { customBasePath }),
            ...(inventoryBasePath && { inventoryBasePath }),
          };
        },
        endpoint: 'systems',
        paginationType: PAGINATION_TYPES.OFFSET,
      }),
    }),
  }),
});

export const {
  useGetSystemsQuery,
  useLazygetSystemsQuery,
  useGetSystemQuery,
  useLazygetSystemQuery,
  useGetSystemsBatchedQuery,
  useLazyGetSystemsBatchedQuery,
} = Systems;
