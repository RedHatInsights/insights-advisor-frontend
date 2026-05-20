import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { BASE_URL } from '../../AppConstants';

/**
 * Fetch pathways from the API with query parameters
 * @param {object} params - Query parameters (offset, limit, sort, filters, etc.)
 * @returns {Promise<object>} - API response { data: [...], meta: { count: number } }
 */
export const fetchPathways = async (params = {}) => {
  const { pagination, filters, sort, ...rest } = params;

  const flatParams = {
    ...pagination,
    ...filters,
    ...rest,
  };

  if (sort) {
    flatParams.sort = sort;
  }

  const queryParams = new URLSearchParams();

  Object.entries(flatParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  const url = `${BASE_URL}/pathway/?${queryParams.toString()}`;
  const response = await instance.get(url);

  if (response.data?.data && response.data?.meta) {
    return response.data;
  }

  // Check if axios interceptor unwrapped and moved meta to response.meta
  if (Array.isArray(response.data) && response.meta) {
    return {
      data: response.data,
      meta: response.meta,
    };
  }

  // Fallback: Cypress sometimes returns just the data array
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: { count: response.data.length },
    };
  }

  return response.data;
};

/**
 * Fetch a single pathway by slug
 * @param {string} slug - Pathway slug
 * @param {object} options - Additional query parameters
 * @returns {Promise<object>} - Pathway data
 */
export const fetchPathway = async (slug, options = {}) => {
  const queryParams = new URLSearchParams(options);
  const url = `${BASE_URL}/pathway/${slug}/?${queryParams.toString()}`;
  const response = await instance.get(url);

  return response.data;
};
