import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import messages from '../Messages';

const dataFetch = async (envContext) => {
  try {
    const data = await instance.get(envContext.STATS_OVERVIEW_FETCH_URL);
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
