import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicRecsBaseQuery } from '../Utilities/Api';

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: dynamicRecsBaseQuery,
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getConventionalDevices: build.query({
      query: (args) => ({
        url: '/hosts?page=1&per_page=1&system_type=conventional',
        ...args,
      }),
    }),
    getEdgeDevices: build.query({
      query: (args) => ({
        url: '/hosts?page=1&per_page=1&system_type=edge',
        ...args,
      }),
    }),
  }),
});

export const { useGetConventionalDevicesQuery, useGetEdgeDevicesQuery } =
  SystemVariety;
