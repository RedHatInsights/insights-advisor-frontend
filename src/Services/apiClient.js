import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as insightsApi from '@redhat-cloud-services/insights-client';
import { useMemo } from 'react';

/**
 * Helper to flatten nested params structure to match insights-client API
 * @param {object} params - Params with pagination/filters/sort structure
 * @returns {object} - Flattened params for insights-client
 */
const flattenParams = (params = {}) => {
  const { pagination, filters, sort, ...rest } = params;

  const flatParams = {
    ...pagination,
    ...filters,
    ...rest,
  };

  if (sort) {
    flatParams.sort = sort;
  }

  return flatParams;
};

/**
 * Normalize API response to consistent format
 * Handles different response structures from axios interceptors and test environments
 * @param {object} response - Axios response
 * @returns {object} - Normalized { data: [...], meta: { count: number } }
 */
const normalizeResponse = (response) => {
  // Standard API response with data and meta
  if (response.data?.data && response.data?.meta) {
    return response.data;
  }

  // Axios interceptor unwrapped: data in response.data, meta in response.meta
  if (Array.isArray(response.data) && response.meta) {
    return {
      data: response.data,
      meta: response.meta,
    };
  }

  // Fallback for Cypress/test environments: just the data array
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: { count: response.data.length },
    };
  }

  return response.data;
};

/**
 * Fetch pathways from the API
 * @param {object} axios - Axios instance with platform interceptors
 * @param {object} params - Query parameters (offset, limit, sort, filters, etc.)
 * @returns {Promise<object>} - API response { data: [...], meta: { count: number } }
 */
export const fetchPathways = async (axios, params = {}) => {
  const api = APIFactory(window.location.origin, insightsApi, { axios });
  const flatParams = flattenParams(params);
  const response = await api.pathwayList(flatParams);
  return normalizeResponse(response);
};

/**
 * Fetch a single pathway by slug
 * @param {object} axios - Axios instance with platform interceptors
 * @param {string} slug - Pathway slug
 * @param {object} options - Additional query parameters
 * @returns {Promise<object>} - Pathway data
 */
export const fetchPathway = async (axios, slug, options = {}) => {
  const api = APIFactory(window.location.origin, insightsApi, { axios });
  const response = await api.pathwayRetrieve({ slug, ...options });
  return response.data;
};

/**
 * Fetch topics from the API
 * @param {object} axios - Axios instance with platform interceptors
 * @param {object} options - Query parameters
 * @returns {Promise<Array>} - Array of topics
 */
export const fetchTopics = async (axios, options = {}) => {
  const api = APIFactory(window.location.origin, insightsApi, { axios });

  // Map show_disabled to showDisabled (camelCase for client)
  const params = {
    ...options,
    showDisabled: options.show_disabled,
  };
  delete params.show_disabled;

  const response = await api.topicList(params);
  return response;
};

/**
 * Fetch a single topic by slug
 * @param {object} axios - Axios instance with platform interceptors
 * @param {string} topicId - Topic slug/ID
 * @param {object} options - Additional query parameters
 * @returns {Promise<object>} - Topic data
 */
export const fetchTopic = async (axios, topicId, options = {}) => {
  const api = APIFactory(window.location.origin, insightsApi, { axios });
  const response = await api.topicRetrieve({ slug: topicId, ...options });
  return response;
};

/**
 * Hook to fetch pathways from the API
 * @returns {Function} - fetchPathways function with axios pre-bound
 */
export const useFetchPathways = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return useMemo(() => (params) => fetchPathways(axios, params), [axios]);
};

/**
 * Hook to fetch a single pathway by slug
 * @returns {Function} - fetchPathway function with axios pre-bound
 */
export const useFetchPathway = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return useMemo(
    () => (slug, options) => fetchPathway(axios, slug, options),
    [axios],
  );
};

/**
 * Hook to fetch topics from the API
 * @returns {Function} - fetchTopics function with axios pre-bound
 */
export const useFetchTopics = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return useMemo(() => (options) => fetchTopics(axios, options), [axios]);
};

/**
 * Hook to fetch a single topic by slug
 * @returns {Function} - fetchTopic function with axios pre-bound
 */
export const useFetchTopic = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return useMemo(
    () => (topicId, options) => fetchTopic(axios, topicId, options),
    [axios],
  );
};
