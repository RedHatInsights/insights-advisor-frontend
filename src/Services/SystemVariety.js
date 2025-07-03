import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const dynamicBaseQuery = async (args, api, extraOptions) => {
  let baseUrl;
  if (typeof args === 'string') {
    baseUrl = '/api/inventory/v1';
  } else if (args && typeof args === 'object' && args.baseUrl) {
    baseUrl = args.baseUrl;
  } else {
    baseUrl = '/api/inventory/v1';
  }

  const rawBaseQuery = fetchBaseQuery({ baseUrl });
  const finalArgsForFetchBaseQuery =
    typeof args === 'string' ? args : { ...args, baseUrl: undefined };

  return rawBaseQuery(finalArgsForFetchBaseQuery, api, extraOptions);
};

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: dynamicBaseQuery,
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
