/* eslint-disable max-len */

import { createIntl, createIntlCache } from 'react-intl';

import { intlHelper } from '@redhat-cloud-services/frontend-components-translations/';
import messages from './Messages';
import { strong } from './Utilities/intlHelper';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    // eslint-disable-next-line no-console
    onError: console.log,
    locale,
  },
  cache
);
const intlSettings = { locale };

export const BASE_URI = document.baseURI;
export const BASE_URL = '/api/insights/v1';
export const UI_BASE = './insights';
export const DEBOUNCE_DELAY = 600;
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;
export const STATS_REPORTS_FETCH_URL = `${BASE_URL}/stats/reports/`;
export const SYSTEMS_FETCH_URL = `${BASE_URL}/system/`;
export const SYSTEM_TYPES = { rhel: 105, ocp: 325 };
export const RULE_CATEGORIES = {
  availability: 1,
  security: 2,
  stability: 3,
  performance: 4,
};
export const SEVERITY_MAP = {
  'critical-risk': 4,
  'high-risk': 3,
  'medium-risk': 2,
  'low-risk': 1,
};
export const RISK_OF_CHANGE_DESC = {
  1: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextOne, {
      strong: (str) => strong(str),
    }),
    intlSettings
  ),
  2: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextTwo, {
      strong: (str) => strong(str),
    }),
    intlSettings
  ),
  3: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextThree, {
      strong: (str) => strong(str),
    }),
    intlSettings
  ),
  4: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextFour, {
      strong: (str) => strong(str),
    }),
    intlSettings
  ),
};
export const IMPACT_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const IMPACT_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.medium).toLowerCase(),
    intlSettings
  ),
  3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings
  ),
};
export const LIKELIHOOD_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const LIKELIHOOD_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.medium).toLowerCase(),
    intlSettings
  ),
  3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings
  ),
};
export const RISK_OF_CHANGE_LABEL = {
  1: intlHelper(intl.formatMessage(messages.veryLow), intlSettings),
  2: intlHelper(intl.formatMessage(messages.low), intlSettings),
  3: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  4: intlHelper(intl.formatMessage(messages.high), intlSettings),
};
export const TOTAL_RISK_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  3: intlHelper(intl.formatMessage(messages.important), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const TOTAL_RISK_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.moderate).toLowerCase(),
    intlSettings
  ),
  3: intlHelper(
    intl.formatMessage(messages.important).toLowerCase(),
    intlSettings
  ),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings
  ),
};

export const PATHWAYS_FILTER_CATEGORIES = {
  has_incident: {
    type: 'checkbox',
    title: 'incidents',
    urlParam: 'has_incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentRules),
          intlSettings
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentRules),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
  reboot_required: {
    type: 'checkbox',
    title: 'reboot required',
    urlParam: 'reboot_required',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.required), intlSettings),
        text: intlHelper(intl.formatMessage(messages.required), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings
        ),
        text: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
};

export const FILTER_CATEGORIES = {
  total_risk: {
    type: 'checkbox',
    title: 'total risk',
    urlParam: 'total_risk',
    values: [
      { label: TOTAL_RISK_LABEL[4], value: '4' },
      { label: TOTAL_RISK_LABEL[3], value: '3' },
      { label: TOTAL_RISK_LABEL[2], value: '2' },
      { label: TOTAL_RISK_LABEL[1], value: '1' },
    ],
  },
  res_risk: {
    type: 'checkbox',
    title: 'risk of change',
    urlParam: 'res_risk',
    values: [
      { label: RISK_OF_CHANGE_LABEL[4], value: '4' },
      { label: RISK_OF_CHANGE_LABEL[3], value: '3' },
      { label: RISK_OF_CHANGE_LABEL[2], value: '2' },
      { label: RISK_OF_CHANGE_LABEL[1], value: '1' },
    ],
  },
  impact: {
    type: 'checkbox',
    title: 'impact',
    urlParam: 'impact',
    values: [
      { label: IMPACT_LABEL[4], value: '4' },
      { label: IMPACT_LABEL[3], value: '3' },
      { label: IMPACT_LABEL[2], value: '2' },
      { label: IMPACT_LABEL[1], value: '1' },
    ],
  },
  likelihood: {
    type: 'checkbox',
    title: 'likelihood',
    urlParam: 'likelihood',
    values: [
      { label: LIKELIHOOD_LABEL[4], value: '4' },
      { label: LIKELIHOOD_LABEL[3], value: '3' },
      { label: LIKELIHOOD_LABEL[2], value: '2' },
      { label: LIKELIHOOD_LABEL[1], value: '1' },
    ],
  },
  category: {
    type: 'checkbox',
    title: 'category',
    urlParam: 'category',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.availability),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.availability}`,
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.performance),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.performance}`,
      },
      {
        label: intlHelper(intl.formatMessage(messages.stability), intlSettings),
        value: `${RULE_CATEGORIES.stability}`,
      },
      {
        label: intlHelper(intl.formatMessage(messages.security), intlSettings),
        value: `${RULE_CATEGORIES.security}`,
      },
    ],
  },
  incident: {
    type: 'checkbox',
    title: 'incidents',
    urlParam: 'incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentRules),
          intlSettings
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentRules),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
  has_playbook: {
    type: 'checkbox',
    title: 'remediation',
    urlParam: 'has_playbook',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.ansibleSupportYes),
          intlSettings
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.ansibleSupportNo),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
  reboot: {
    type: 'checkbox',
    title: 'reboot required',
    urlParam: 'reboot',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.required), intlSettings),
        text: intlHelper(intl.formatMessage(messages.required), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings
        ),
        text: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
  rule_status: {
    type: 'radio',
    title: 'status',
    urlParam: 'rule_status',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.all), intlSettings),
        value: 'all',
      },
      {
        label: intlHelper(intl.formatMessage(messages.enabled), intlSettings),
        value: 'enabled',
      },
      {
        label: intlHelper(intl.formatMessage(messages.disabled), intlSettings),
        value: 'disabled',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.redhatDisabled),
          intlSettings
        ),
        value: 'rhdisabled',
      },
    ],
  },
  impacting: {
    type: 'checkbox',
    title: 'systems impacted',
    urlParam: 'impacting',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.oneOrMore), intlSettings),
        text: intlHelper(intl.formatMessage(messages.oneOrMore), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(intl.formatMessage(messages.none), intlSettings),
        text: intlHelper(intl.formatMessage(messages.none), intlSettings),
        value: 'false',
      },
    ],
  },
};

export const SYSTEM_FILTER_CATEGORIES = {
  hits: {
    type: 'checkbox',
    title: 'Total Risk',
    urlParam: 'hits',
    values: [
      { label: 'All systems', text: 'All systems', value: 'all' },
      ...FILTER_CATEGORIES.total_risk.values,
    ],
  },
  incident: {
    type: 'checkbox',
    title: 'Incidents',
    urlParam: 'incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentSystems),
          intlSettings
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentSystems),
          intlSettings
        ),
        value: 'false',
      },
    ],
  },
  rhel_version: {
    type: 'checkbox',
    title: 'Operating system',
    urlParam: 'rhel_version',
    values: [
      {
        label: 'RHEL 9.0',
        value: '9.0',
      },
      {
        label: 'RHEL 8.6',
        value: '8.6',
      },
      {
        label: 'RHEL 8.5',
        value: '8.5',
      },
      {
        label: 'RHEL 8.4',
        value: '8.4',
      },
      {
        label: 'RHEL 8.3',
        value: '8.3',
      },
      {
        label: 'RHEL 8.2',
        value: '8.2',
      },
      {
        label: 'RHEL 8.1',
        value: '8.1',
      },
      {
        label: 'RHEL 8.0',
        value: '8.0',
      },
      {
        label: 'RHEL 7.9',
        value: '7.9',
      },
      {
        label: 'RHEL 7.8',
        value: '7.8',
      },
      {
        label: 'RHEL 7.7',
        value: '7.7',
      },
      {
        label: 'RHEL 7.6',
        value: '7.6',
      },
      {
        label: 'RHEL 7.5',
        value: '7.5',
      },
      {
        label: 'RHEL 7.4',
        value: '7.4',
      },
      {
        label: 'RHEL 7.3',
        value: '7.3',
      },
      {
        label: 'RHEL 7.2',
        value: '7.2',
      },
      {
        label: 'RHEL 7.1',
        value: '7.1',
      },
      {
        label: 'RHEL 7.0',
        value: '7.0',
      },
      {
        label: 'RHEL 6.10',
        value: '6.10',
      },
      {
        label: 'RHEL 6.9',
        value: '6.9',
      },
      {
        label: 'RHEL 6.8',
        value: '6.8',
      },
      {
        label: 'RHEL 6.7',
        value: '6.7',
      },
      {
        label: 'RHEL 6.6',
        value: '6.6',
      },
      {
        label: 'RHEL 6.5',
        value: '6.5',
      },
      {
        label: 'RHEL 6.4',
        value: '6.4',
      },
      {
        label: 'RHEL 6.3',
        value: '6.3',
      },
      {
        label: 'RHEL 6.2',
        value: '6.2',
      },
      {
        label: 'RHEL 6.1',
        value: '6.1',
      },
      {
        label: 'RHEL 6.0',
        value: '6.0',
      },
    ],
  },
};

export const PERMS = {
  export: ['advisor:*:*', 'advisor:exports:read'],
  disableRec: ['advisor:*:*', 'advisor:disable-recommendations:write'],
  viewRecs: ['advisor:*:*', 'advisor:recommendation-results:read'],
};

export const exportNotifications = {
  pending: {
    title: `Preparing export. Once complete, your download will start automatically.`,
    variant: 'info',
  },
  success: {
    title: `Downloading export`,
    variant: 'success',
  },
  error: {
    title: 'Couldn’t download export. Reinitiate this export to try again.',
    variant: 'danger',
    autoDismiss: false,
  },
};
