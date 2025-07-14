import { AxiosBaseQuery } from '../Utilities/Api';
import { BASE_URL } from '../AppConstants';
import { createApi } from '@reduxjs/toolkit/query/react';

const dynamicRecsBaseQuery = async (args, api, extraOptions) => {
  let baseUrlToUse = BASE_URL;
  let actualUrlPath = '';

  const processedArgs = typeof args === 'object' && args !== null ? args : {};

  // Extract common properties for AxiosBaseQuery
  const {
    url: argUrl,
    headers: argHeaders,
    options: argOptions,
    search: argSearch,
    method: argMethod,
    customBasePath: argCustomBasePath,
    ...remainingParams
  } = processedArgs;

  actualUrlPath = argUrl || '';

  let finalSearchString = argSearch;
  if (Object.keys(remainingParams).length > 0) {
    const remainingQueryParams = new URLSearchParams(
      remainingParams,
    ).toString();
    if (finalSearchString) {
      finalSearchString += `&${remainingQueryParams}`;
    } else {
      finalSearchString = remainingQueryParams;
    }
  }

  const finalArgsForAxiosBaseQuery = {
    url: actualUrlPath,
    headers: argHeaders,
    options: argOptions,
    search: finalSearchString,
    method: argMethod,
  };

  const baseQueryInstance = AxiosBaseQuery({ baseUrl: baseUrlToUse });

  return baseQueryInstance(finalArgsForAxiosBaseQuery, api, extraOptions);
};

export const Recs = createApi({
  reducerPath: 'recs',
  baseQuery: dynamicRecsBaseQuery,
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
  }),
});

export const { useGetRecsQuery, useGetRecQuery, useGetRecsystemsQuery } = Recs;
