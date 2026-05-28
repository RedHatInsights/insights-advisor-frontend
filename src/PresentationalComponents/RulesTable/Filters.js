import { FILTER_CATEGORIES as FC } from '../../AppConstants';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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

/**
 * Total Risk checkbox filter
 */
export const totalRiskFilter = {
  type: 'checkbox',
  label: capitalize(FC.total_risk.title),
  filterAttribute: FC.total_risk.urlParam,
  id: FC.total_risk.urlParam,
  urlParam: FC.total_risk.urlParam,
  items: FC.total_risk.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { total_risk: values } : {};
  },
};

/**
 * Resolution Risk checkbox filter
 */
export const resolutionRiskFilter = {
  type: 'checkbox',
  label: capitalize(FC.res_risk.title),
  filterAttribute: FC.res_risk.urlParam,
  id: FC.res_risk.urlParam,
  urlParam: FC.res_risk.urlParam,
  items: FC.res_risk.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { res_risk: values } : {};
  },
};

/**
 * Impact checkbox filter
 */
export const impactFilter = {
  type: 'checkbox',
  label: capitalize(FC.impact.title),
  filterAttribute: FC.impact.urlParam,
  id: FC.impact.urlParam,
  urlParam: FC.impact.urlParam,
  items: FC.impact.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { impact: values } : {};
  },
};

/**
 * Likelihood checkbox filter
 */
export const likelihoodFilter = {
  type: 'checkbox',
  label: capitalize(FC.likelihood.title),
  filterAttribute: FC.likelihood.urlParam,
  id: FC.likelihood.urlParam,
  urlParam: FC.likelihood.urlParam,
  items: FC.likelihood.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { likelihood: values } : {};
  },
};

/**
 * Category checkbox filter
 */
export const categoryFilter = {
  type: 'checkbox',
  label: capitalize(FC.category.title),
  filterAttribute: FC.category.urlParam,
  id: FC.category.urlParam,
  urlParam: FC.category.urlParam,
  items: FC.category.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { category: values } : {};
  },
};

/**
 * Incident checkbox filter
 */
export const incidentFilter = {
  type: 'checkbox',
  label: capitalize(FC.incident.title),
  filterAttribute: FC.incident.urlParam,
  id: FC.incident.urlParam,
  urlParam: FC.incident.urlParam,
  items: FC.incident.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { incident: values[0] } : {};
  },
};

/**
 * Has Playbook checkbox filter
 */
export const playbookFilter = {
  type: 'checkbox',
  label: capitalize(FC.has_playbook.title),
  filterAttribute: FC.has_playbook.urlParam,
  id: FC.has_playbook.urlParam,
  urlParam: FC.has_playbook.urlParam,
  items: FC.has_playbook.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { has_playbook: values[0] } : {};
  },
};

/**
 * Reboot Required checkbox filter
 */
export const rebootFilter = {
  type: 'checkbox',
  label: capitalize(FC.reboot.title),
  filterAttribute: FC.reboot.urlParam,
  id: FC.reboot.urlParam,
  urlParam: FC.reboot.urlParam,
  items: FC.reboot.values,
  filterSerialiser: (value) => {
    const values = Array.isArray(value) ? value : [];
    return values.length > 0 ? { reboot: values[0] } : {};
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
  incidentFilter,
  playbookFilter,
  rebootFilter,
];
