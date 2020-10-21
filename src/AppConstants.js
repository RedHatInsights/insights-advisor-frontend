/* eslint-disable max-len */

import { createIntl, createIntlCache } from 'react-intl';

import { intlHelper } from '@redhat-cloud-services/frontend-components-translations';
import messages from './Messages';
import { strong } from './Utilities/intlHelper';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl({
    // eslint-disable-next-line no-console
    onError: console.log,
    locale
}, cache);
const intlSettings = { locale };

export const RULE_FETCH = 'RULE_FETCH';
export const RULES_FETCH = 'RULES_FETCH';
export const SYSTEM_FETCH = 'SYSTEM_FETCH';
export const SYSTEMTYPE_FETCH = 'SYSTEMTYPE_FETCH';
export const STATS_RULES_FETCH = 'STATS_RULES_FETCH';
export const STATS_SYSTEMS_FETCH = 'STATS_SYSTEMS_FETCH';
export const STATS_STALEHOSTS_FETCH = 'STATS_STALEHOSTS_FETCH';
export const STATS_REPORTS_FETCH = 'STATS_REPORTS_FETCH';
export const FILTERS_SET = 'FILTERS_SET';
export const TOPIC_FETCH = 'TOPIC_FETCH';
export const TOPICS_FETCH = 'TOPICS_FETCH';
export const SYSTEMS_FETCH = 'SYSTEMS_FETCH';
export const RULE_ACK_FETCH = 'RULE_ACK_FETCH';
export const RULE_ACK_SET = 'RULE_ACK_SET';
export const HOST_ACK_FETCH = 'HOST_ACK_FETCH';
export const HOST_ACK_SET = 'HOST_ACK_SET';
export const FILTERS_SYSTEMS_SET = 'FILTERS_SYSTEMS_SET';
export const SELECTED_TAGS_SET = 'SELECTED_TAGS_SET';
export const RULE_SET = 'RULE_SET';
export const SYSTEM_SET = 'SYSTEM_SET';
export const WORKLOADS_SET = 'WORKLOADS_SET';
export const SID_SET = 'SID_SET';

export const BASE_URL = '/api/insights/v1';
export const INV_BASE_URL = '/api/inventory/v1';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_RULES_FETCH_URL = `${BASE_URL}/stats/rules/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;
export const STATS_REPORTS_FETCH_URL = `${BASE_URL}/stats/reports/`;
export const STATS_STALEHOSTS_FETCH_URL = `${BASE_URL}/stats/stale_hosts/`;
export const TOPICS_FETCH_URL = `${BASE_URL}/topic/`;
export const SYSTEMS_FETCH_URL = `${BASE_URL}/system/`;
export const RULE_ACK_URL = `${BASE_URL}/ack/`;
export const HOST_ACK_URL = `${BASE_URL}/hostack/`;

export const UI_BASE = './insights';
export const SYSTEM_TYPES = { rhel: 105, ocp: 325 };
export const DEBOUNCE_DELAY = 600;
export const RULE_CATEGORIES = {
    availability: 1,
    security: 2,
    stability: 3,
    performance: 4
};
export const SEVERITY_MAP = {
    'critical-risk': 4,
    'high-risk': 3,
    'medium-risk': 2,
    'low-risk': 1
};
export const RISK_OF_CHANGE_DESC = {
    1: intlHelper(intl.formatMessage(
        messages.riskOfChangeTextOne, { strong: str => strong(str) }
    ), intlSettings),
    2: intlHelper(intl.formatMessage(
        messages.riskOfChangeTextTwo, { strong: str => strong(str) }
    ), intlSettings),
    3: intlHelper(intl.formatMessage(
        messages.riskOfChangeTextThree, { strong: str => strong(str) }
    ), intlSettings),
    4: intlHelper(intl.formatMessage(
        messages.riskOfChangeTextFour, { strong: str => strong(str) }
    ), intlSettings)
};
export const IMPACT_LABEL = {
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
    3: intlHelper(intl.formatMessage(messages.high), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const IMPACT_LABEL_LOWER = {
    1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
    2: intlHelper(intl.formatMessage(messages.medium).toLowerCase(), intlSettings),
    3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical).toLowerCase(), intlSettings)
};
export const LIKELIHOOD_LABEL = {
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
    3: intlHelper(intl.formatMessage(messages.high), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const LIKELIHOOD_LABEL_LOWER = {
    1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
    2: intlHelper(intl.formatMessage(messages.medium).toLowerCase(), intlSettings),
    3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical).toLowerCase(), intlSettings)
};
export const RISK_OF_CHANGE_LABEL = {
    1: intlHelper(intl.formatMessage(messages.veryLow), intlSettings),
    2: intlHelper(intl.formatMessage(messages.low), intlSettings),
    3: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    4: intlHelper(intl.formatMessage(messages.high), intlSettings)
};
export const TOTAL_RISK_LABEL = {
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    3: intlHelper(intl.formatMessage(messages.important), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const TOTAL_RISK_LABEL_LOWER = {
    1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
    2: intlHelper(intl.formatMessage(messages.moderate).toLowerCase(), intlSettings),
    3: intlHelper(intl.formatMessage(messages.important).toLowerCase(), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical).toLowerCase(), intlSettings)
};
export const FILTER_CATEGORIES = {
    total_risk: {
        type: 'checkbox', title: 'total risk', urlParam: 'total_risk', values: [
            { label: TOTAL_RISK_LABEL[4], value: '4' },
            { label: TOTAL_RISK_LABEL[3], value: '3' },
            { label: TOTAL_RISK_LABEL[2], value: '2' },
            { label: TOTAL_RISK_LABEL[1], value: '1' }
        ]
    },
    res_risk: {
        type: 'checkbox', title: 'risk of change', urlParam: 'res_risk', values: [
            { label: RISK_OF_CHANGE_LABEL[4], value: '4' },
            { label: RISK_OF_CHANGE_LABEL[3], value: '3' },
            { label: RISK_OF_CHANGE_LABEL[2], value: '2' },
            { label: RISK_OF_CHANGE_LABEL[1], value: '1' }
        ]
    },
    impact: {
        type: 'checkbox', title: 'impact', urlParam: 'impact', values: [
            { label: IMPACT_LABEL[4], value: '4' },
            { label: IMPACT_LABEL[3], value: '3' },
            { label: IMPACT_LABEL[2], value: '2' },
            { label: IMPACT_LABEL[1], value: '1' }
        ]
    },
    likelihood: {
        type: 'checkbox', title: 'likelihood', urlParam: 'likelihood', values: [
            { label: LIKELIHOOD_LABEL[4], value: '4' },
            { label: LIKELIHOOD_LABEL[3], value: '3' },
            { label: LIKELIHOOD_LABEL[2], value: '2' },
            { label: LIKELIHOOD_LABEL[1], value: '1' }
        ]
    },
    category: {
        type: 'checkbox', title: 'category', urlParam: 'category', values: [
            { label: intlHelper(intl.formatMessage(messages.availability), intlSettings), value: `${RULE_CATEGORIES.availability}` },
            { label: intlHelper(intl.formatMessage(messages.performance), intlSettings), value: `${RULE_CATEGORIES.performance}` },
            { label: intlHelper(intl.formatMessage(messages.stability), intlSettings), value: `${RULE_CATEGORIES.stability}` },
            { label: intlHelper(intl.formatMessage(messages.security), intlSettings), value: `${RULE_CATEGORIES.security}` }
        ]
    },
    incident: {
        type: 'checkbox', title: 'incidents', urlParam: 'incident', values: [
            { label: intlHelper(intl.formatMessage(messages.incidentRules), intlSettings), value: 'true' },
            { label: intlHelper(intl.formatMessage(messages.nonIncidentRules), intlSettings), value: 'false' }
        ]
    },
    has_playbook: {
        type: 'checkbox', title: 'Ansible support', urlParam: 'has_playbook', values: [
            { label: 'Ansible remediation support', text: 'Ansible remediation support', value: 'true' },
            { label: 'No Ansible remediation support', text: 'No Ansible remediation support', value: 'false' }
        ]
    },
    reboot: {
        type: 'checkbox', title: 'Reboot required', urlParam: 'reboot', values: [
            { label: 'Yes', text: 'Yes', value: 'true' },
            { label: 'No', text: 'No', value: 'false' }
        ]
    },
    rule_status: {
        type: 'radio', title: 'status', urlParam: 'rule_status', values: [
            { label: intlHelper(intl.formatMessage(messages.all), intlSettings), value: 'all' },
            { label: intlHelper(intl.formatMessage(messages.enabled), intlSettings), value: 'enabled' },
            { label: intlHelper(intl.formatMessage(messages.disabled), intlSettings), value: 'disabled' },
            { label: intlHelper(intl.formatMessage(messages.redhatDisabled), intlSettings), value: 'rhdisabled' }
        ]
    }
};

export const SYSTEM_FILTER_CATEGORIES = {
    hits: {
        type: 'checkbox', title: 'Total Risk', urlParam: 'hits', values: [
            { label: 'All systems', text: 'All systems', value: 'all' },
            ...FILTER_CATEGORIES.total_risk.values
        ]
    }
};

export const isGlobalFilter = () => {
    return insights.chrome.isBeta() || Boolean(localStorage.getItem('chrome:experimental:global-filter'));
};
