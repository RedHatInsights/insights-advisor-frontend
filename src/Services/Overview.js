import { Get } from '../Utilities/Api';
import messages from '../Messages';
import { STATS_OVERVIEW_FETCH_URL } from '../AppConstants';

const dataFetch = async () => {
  try {
    const response = await Get(STATS_OVERVIEW_FETCH_URL);
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
