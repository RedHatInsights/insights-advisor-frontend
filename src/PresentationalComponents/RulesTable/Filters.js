import { FILTER_CATEGORIES } from '../../AppConstants';
import { workloadArrayQueryBuilder } from '../Common/Tables';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Factory for multi-value checkbox filters (total_risk, res_risk, impact, likelihood, category)
 * Sends array of selected values as the API param when non-empty.
 */
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

/**
 * Factory for boolean checkbox filters (incident, has_playbook, reboot)
 * When exactly one option is selected, sends it as the API param.
 * When both are selected (or none), sends no filter — "both selected = no filter".
 */
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

/**
 * Text search filter
 */
export const textFilter = {
  type: 'text',
  label: 'Name',
  filterAttribute: 'text',
  id: 'text',
  urlParam: 'text',
  placeholder: 'Filter by name',
  filterSerialiser: (value) => {
    const textValue = Array.isArray(value) ? value[0] : value;
    return textValue ? { text: textValue } : {};
  },
};

/** Total Risk checkbox filter */
export const totalRiskFilter = createMultiValueFilter(
  FILTER_CATEGORIES.total_risk,
  'total_risk',
);
/** Resolution Risk checkbox filter */
export const resolutionRiskFilter = createMultiValueFilter(
  FILTER_CATEGORIES.res_risk,
  'res_risk',
);
/** Impact checkbox filter */
export const impactFilter = createMultiValueFilter(
  FILTER_CATEGORIES.impact,
  'impact',
);
/** Likelihood checkbox filter */
export const likelihoodFilter = createMultiValueFilter(
  FILTER_CATEGORIES.likelihood,
  'likelihood',
);
/** Category checkbox filter */
export const categoryFilter = createMultiValueFilter(
  FILTER_CATEGORIES.category,
  'category',
);

/** Incident checkbox filter (boolean: both selected = no filter) */
export const incidentFilter = createBooleanFilter(
  FILTER_CATEGORIES.incident,
  'incident',
);
/** Has Playbook checkbox filter (boolean: both selected = no filter) */
export const playbookFilter = createBooleanFilter(
  FILTER_CATEGORIES.has_playbook,
  'has_playbook',
);
/** Reboot Required checkbox filter (boolean: both selected = no filter) */
export const rebootFilter = createBooleanFilter(
  FILTER_CATEGORIES.reboot,
  'reboot',
);

/**
 * Status filter (checkbox: enabled/disabled/rhdisabled, single-select)
 */
export const ruleStatusFilter = {
  type: 'checkbox',
  label: capitalize(FILTER_CATEGORIES.rule_status.title),
  filterAttribute: FILTER_CATEGORIES.rule_status.urlParam,
  id: FILTER_CATEGORIES.rule_status.urlParam,
  urlParam: FILTER_CATEGORIES.rule_status.urlParam,
  items: FILTER_CATEGORIES.rule_status.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { rule_status: values[0] } : {};
  },
};

/**
 * Systems impacted filter (checkbox: true/false, single-select)
 */
export const impactingFilter = {
  type: 'checkbox',
  label: 'Systems impacted',
  filterAttribute: 'impacting',
  id: 'impacting',
  urlParam: 'impacting',
  items: [
    { label: '1 or more', value: 'true' },
    { label: 'None', value: 'false' },
  ],
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { impacting: values[0] } : {};
  },
};

/**
 * Workload filter (checkbox: multi-select)
 * Uses workloadArrayQueryBuilder to convert array to repeated params
 */
export const workloadFilter = {
  type: 'checkbox',
  label: capitalize(FILTER_CATEGORIES.workload.title),
  filterAttribute: FILTER_CATEGORIES.workload.urlParam,
  id: FILTER_CATEGORIES.workload.urlParam,
  urlParam: FILTER_CATEGORIES.workload.urlParam,
  items: FILTER_CATEGORIES.workload.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return workloadArrayQueryBuilder(values);
  },
};

/**
 * Returns array of all filter configurations for RulesTable
 */
export default [
  textFilter,
  totalRiskFilter,
  resolutionRiskFilter,
  impactFilter,
  likelihoodFilter,
  categoryFilter,
  ruleStatusFilter,
  impactingFilter,
  workloadFilter,
  incidentFilter,
  playbookFilter,
  rebootFilter,
];
