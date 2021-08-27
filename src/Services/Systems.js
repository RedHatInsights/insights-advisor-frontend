import * as AppConst from '../AppConstants';

import { AxiosBaseQuery } from '../Utilities/Api';
import { createApi } from '@reduxjs/toolkit/query/react';

export const Systems = createApi({
  reducerPath: 'systems',
  baseQuery: AxiosBaseQuery({ baseUrl: AppConst.BASE_URL }),
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
  }),
});

export const {
  useGetSystemsQuery,
  useLazygetSystemsQuery,
  useGetSystemQuery,
  useLazygetSystemQuery,
} = Systems;
