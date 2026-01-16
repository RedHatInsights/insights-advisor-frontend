import React from 'react';
import axios from 'axios';
import { IoP } from '../index';

/**
 * Response data interceptor that extracts data from axios responses.
 * @param {Object} response - Axios response object
 * @returns {Object} Response data or full response if data is not present
 */
export function responseDataInterceptor(response) {
  if (response.data) {
    return response.data;
  }

  return response;
}

/**
 * Axios instance configured for IoP environment.
 * Pre-configured with /insights_cloud/ base URL and response interceptor.
 */
const iopAxiosInstance = axios.create({ baseURL: '/insights_cloud/' });
iopAxiosInstance.interceptors.response.use(responseDataInterceptor);

/**
 * Wrapped recommendation detail component for module federation export.
 * Pre-configured with IoP environment context and axios instance.
 *
 * @type {React.ComponentType}
 * @see {@link module:IoP~IoP.IopRecommendationDetails}
 */
const RecommendationDetailsWrapped = (props) => (
  <IoP.IopRecommendationDetails {...props} axios={iopAxiosInstance} />
);

export default RecommendationDetailsWrapped;
