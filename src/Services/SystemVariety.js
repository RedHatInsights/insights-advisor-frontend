import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicRecsBaseQuery } from '../Utilities/Api';

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: dynamicRecsBaseQuery,
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
