import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

const checkboxFilter = (
  applyFilterCallback,
  currentFilter = {},
  filterKey,
  filterItems,
  filterLabel,
) => {
  let { [filterKey]: currentValue } = currentFilter;

  const filterBy = (values) => {
    applyFilterCallback({
      ...currentFilter,
      [filterKey]: values.length > 0 ? values : [],
      page: 1,
    });
  };

  return {
    label: filterLabel,
    type: conditionalFilterType.checkbox,
    urlParam: filterKey,
    filterValues: {
      onChange: (event, value) => {
        filterBy(value);
      },
      items: filterItems,
      value: currentValue || [],
    },
    values: filterItems,
  };
};

export default checkboxFilter;
