import { AxiosBaseQuery } from '../Utilities/Api';
import { INVENTORY_BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: AxiosBaseQuery({ baseUrl: INVENTORY_BASE_URL }),
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getConventionalDevices: build.query({
      query: () => ({
        url: `/hosts?page=1&per_page=1&filter[system_profile][host_type]=nil`,
      }),
    }),
    getEdgeDevices: build.query({
      query: () => ({
        url: `/hosts?page=1&per_page=1&filter[system_profile][host_type]=edge`,
      }),
    }),
  }),
});

export const { useGetConventionalDevicesQuery, useGetEdgeDevicesQuery } =
  SystemVariety;
