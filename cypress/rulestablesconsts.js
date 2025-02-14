import _ from 'lodash';
import { CATEGORIES } from './support/globals';
import { cumulativeCombinations } from './utils/table';

const TOTAL_RISK = { Low: 1, Moderate: 2, Important: 3, Critical: 4 };
const RISK_OF_CHANGE = { 'Very Low': 1, Low: 2, Moderate: 3, High: 4 };
const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const CATEGORIES_MAP = {
  Availability: 1,
  Security: 2,
  Stability: 3,
  Performance: 4,
};
const STATUS = ['Enabled', 'Disabled', 'Red Hat Disabled'];
const INCIDENT = { Incident: 'true', 'Non-incident': 'false' };
const REMEDIATION = { 'Ansible playbook': true, Manual: false };
const REBOOT = { Required: true, 'Not required': false };
const IMPACTING = { '1 or more': 'true', None: 'false' };

//Filters configuration
const filtersConf = {
  name: {
    selectorText: 'Name',
    values: ['foobar'],
    type: 'input',
    filterFunc: (it, value) =>
      it.description.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'text',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  riskOfChange: {
    selectorText: 'Risk of change',
    values: Array.from(cumulativeCombinations(Object.keys(RISK_OF_CHANGE))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => RISK_OF_CHANGE[x]).includes(
        it.resolution_set[0].risk
      ),
    urlParam: 'res_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => RISK_OF_CHANGE[x]).join(',')),
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(Object.keys(TOTAL_RISK))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => TOTAL_RISK[x]).includes(it.total_risk),
    urlParam: 'total_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK[x]).join(',')),
  },
  impact: {
    selectorText: 'Impact',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACT))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => IMPACT[x]).includes(it.impact),
    urlParam: 'impact',
    urlValue: (it) => encodeURIComponent(_.map(it, (x) => IMPACT[x]).join(',')),
  },
  likelihood: {
    selectorText: 'Likelihood',
    values: Array.from(cumulativeCombinations(Object.keys(LIKELIHOOD))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => LIKELIHOOD[x]).includes(it.likelihood),
    urlParam: 'likelihood',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => LIKELIHOOD[x]).join(',')),
  },
  category: {
    selectorText: 'Category',
    values: Array.from(cumulativeCombinations(Object.keys(CATEGORIES))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.intersection(
        _.flatMap(value, (x) => CATEGORIES[x]),
        it.tags
      ).length > 0,
    urlParam: 'category',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => CATEGORIES_MAP[x]).join(',')),
  },
  incidents: {
    selectorText: 'Incidents',
    values: Array.from(cumulativeCombinations(Object.keys(INCIDENT))),
    type: 'checkbox',
    urlParam: 'incident',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => INCIDENT[x]).join(',')),
  },
  remediation: {
    selectorText: 'Remediation',
    values: Array.from(cumulativeCombinations(Object.keys(REMEDIATION))),
    type: 'checkbox',
    urlParam: 'has_playbook',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => REMEDIATION[x]).join(',')),
  },
  reboot: {
    selectorText: 'Reboot required',
    values: Array.from(cumulativeCombinations(Object.keys(REBOOT))),
    type: 'checkbox',
    urlParam: 'reboot',
    urlValue: (it) => encodeURIComponent(_.map(it, (x) => REBOOT[x]).join(',')),
  },
  status: {
    selectorText: 'Status',
    values: STATUS,
    type: 'singleSelect',
    filterFunc: (it, value) => {
      return it.disabled === (value === 'Disabled');
    },
    urlParam: 'rule_status',
    urlValue: (it) => it.toLowerCase(),
  },
  impacting: {
    selectorText: 'Systems impacted',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACTING))),
    type: 'checkbox',
    filterFunc: (it, value) => {
      if (!value.includes('1 or more') && it.impacted_systems_count > 0)
        return false;
      if (!value.includes('None') && it.impacted_systems_count === 0)
        return false;
      return true;
    },
    urlParam: 'impacting',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => IMPACTING[x]).join(',')),
  },
};

export { filtersConf };
