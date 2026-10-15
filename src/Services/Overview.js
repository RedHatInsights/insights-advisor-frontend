import messages from '../Messages';

/**
 * Fetches dashboard overview stats from the backend.
 *
 * @param {Object} envContext - Environment context containing STATS_OVERVIEW_FETCH_URL.
 * @param {Object} axios - Axios instance with platform interceptors.
 * @param {Object} [options={}] - Query parameters to pass to the stats endpoint (e.g. tags, groups, workloads).
 * @returns {Promise<Object>} Formatted stats data with loaded and isError flags.
 */
const dataFetch = async (envContext, axios, options = {}) => {
  try {
    const data = await axios.get(envContext.STATS_OVERVIEW_FETCH_URL, {
      params: options,
    });
    if (data) {
      return { ...data, loaded: true, isError: false };
    }
    throw messages.overviewDashbarResponseMissingDataError.defaultMessage;
  } catch (e) {
    console.log(e, messages.overviewDashbarError.defaultMessage);
    return { loaded: false, isError: true };
  }
};

export { dataFetch };
