import checkboxFilter from './GeneralFilterTypes/CheckboxFilter';
import { getImpactingFitlerItems } from '../../AppConstants';

export const getImpactingFilterKey = (hasEdgeDevices) =>
  hasEdgeDevices ? 'update_method' : 'impacting';

export const getImpactingFilterChips = (hasEdgeDevices) => ({
  [getImpactingFilterKey(hasEdgeDevices)]: {
    type: 'radio',
    title: 'Systems impacted',
    urlParam: getImpactingFilterKey(hasEdgeDevices),
    values: getImpactingFitlerItems(hasEdgeDevices),
  },
});

const impactingFilter = (apply, currentFilter = {}, hasEdgeDevices) => {
  const impactingOptions = getImpactingFitlerItems(hasEdgeDevices);

  return checkboxFilter(
    apply,
    currentFilter,
    getImpactingFilterKey(hasEdgeDevices),
    impactingOptions,
    'systems impacted'
  );
};

export default impactingFilter;
