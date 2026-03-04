import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdvisorBaseQuery } from '../Utilities/createAdvisorBaseQuery';
import { BASE_URL } from '../AppConstants';

export const SystemVariety = createApi({
  reducerPath: 'systemVariety',
  baseQuery: createAdvisorBaseQuery({ baseUrl: BASE_URL }),
  keepUnusedDataFor: 5,
  endpoints: (build) => ({
    getConventionalDevices: build.query({
      query: (args) => ({
        url: '/hosts?page=1&per_page=1',
        ...args,
      }),
    }),
  }),
});

export const { useGetConventionalDevicesQuery } = SystemVariety;
