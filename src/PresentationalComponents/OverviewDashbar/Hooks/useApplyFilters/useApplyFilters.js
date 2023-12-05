import { useDispatch } from 'react-redux';
import {
  updateRecFilters,
  filtersInitialState,
} from '../../../../Services/Filters';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  IMPORTANT_TAG,
  CRITICAL_TAG,
  SEVERITY_MAP,
  RECOMMENDATIONS_TAB,
} from '../../../../AppConstants';

function useApplyFilters(changeTab) {
  const dispatch = useDispatch();

  // the initial filters state in recommendations table
  const { recState: defaultFilters } = filtersInitialState;

  // This function is used to apply filters to the recommendations table
  // It resets the values to be the default values, and then adds the values that are passed to it in Addedfilters
  const applyFilters = (Addedfilters) => {
    dispatch(updateRecFilters({ ...defaultFilters, ...Addedfilters }));
  };

  // this function is used to apply filters to the recommendations table based on the title of the card that was clicked
  // also, it changes the tab to the recommendations tab (only if the title matches one of the recommendations titles: critical, important, or incidents)
  const applyFiltersByTitle = (title) => {
    switch (title) {
      case INCIDENTS:
        applyFilters({ incident: true });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      case CRITICAL_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[CRITICAL_TAG] });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      case IMPORTANT_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[IMPORTANT_TAG] });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      default:
        console.log(`Error! applyFiltersByTitle was provided with an invalid title. Valid titles are:
          '${PATHWAYS}', '${INCIDENTS}', '${IMPORTANT_RECOMMENDATIONS}' and '${CRITICAL_RECOMMENDATIONS}'`);
        break;
    }
  };

  return { applyFiltersByTitle };
}

export default useApplyFilters;
