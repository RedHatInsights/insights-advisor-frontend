import { INVENTORY_BASE_URL } from '../AppConstants';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: fetchBaseQuery({ baseUrl: INVENTORY_BASE_URL }),
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getConventionalDevices: build.query({
      query: () =>
        '/hosts?page=1&per_page=1&filter[system_profile][host_type]=nil',
    }),
    getEdgeDevices: build.query({
      query: () =>
        '/hosts?page=1&per_page=1&filter[system_profile][host_type]=edge',
    }),
  }),
});

export const { useGetConventionalDevicesQuery, useGetEdgeDevicesQuery } =
  SystemVariety;
