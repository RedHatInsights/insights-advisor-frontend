import { Get } from '../Utilities/Api';
import messages from '../Messages';

const dataFetch = async (envContext) => {
  try {
    const response = await Get(envContext.STATS_OVERVIEW_FETCH_URL);
    if (response.data) {
      const data = response.data;
      return { ...data, loaded: true, isError: false };
    }
    throw messages.overviewDashbarResponseMissingDataError.defaultMessage;
  } catch (e) {
    console.log(e, messages.overviewDashbarError.defaultMessage);
    return { loaded: false, isError: true };
  }
};

export { dataFetch };
