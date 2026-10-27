import { FILTER_CATEGORIES } from '../../AppConstants';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const createMultiValueFilter = (fc, apiParam) => ({
  type: 'checkbox',
  label: capitalize(fc.title),
  filterAttribute: fc.urlParam,
  id: fc.urlParam,
  urlParam: fc.urlParam,
  items: fc.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { [apiParam]: values } : {};
  },
});

const createBooleanFilter = (fc, apiParam) => ({
  type: 'checkbox',
  label: capitalize(fc.title),
  filterAttribute: fc.urlParam,
  id: fc.urlParam,
  urlParam: fc.urlParam,
  items: fc.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length === 1 ? { [apiParam]: values[0] } : {};
  },
});

export const textFilter = {
  type: 'text',
  label: 'Description',
  filterAttribute: 'text',
  id: 'text',
  urlParam: 'text',
  placeholder: 'Filter by description',
  filterSerialiser: (value) => {
    const textValue = Array.isArray(value) ? value[0] : value;
    return textValue ? { text: textValue } : {};
  },
};

export const totalRiskFilter = createMultiValueFilter(
  FILTER_CATEGORIES.total_risk,
  'total_risk',
);

export const categoryFilter = createMultiValueFilter(
  FILTER_CATEGORIES.category,
  'category',
);

export const playbookFilter = createBooleanFilter(
  FILTER_CATEGORIES.has_playbook,
  'has_playbook',
);

export default [textFilter, totalRiskFilter, categoryFilter, playbookFilter];
