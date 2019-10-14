import { createIntl, createIntlCache } from 'react-intl';
import  { intlHelper }  from '@redhat-cloud-services/frontend-components-translations';
import messages from './Messages';
const cache = createIntlCache();
const locale = navigator.language;
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
export const BREADCRUMBS_SET = 'BREADCRUMBS_SET';
export const FILTERS_SET = 'FILTERS_SET';
export const TOPIC_FETCH = 'TOPIC_FETCH';
export const TOPICS_FETCH = 'TOPICS_FETCH';
export const SYSTEMS_FETCH = 'SYSTEMS_FETCH';

export const BASE_URL = '/api/insights/v1';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_RULES_FETCH_URL = `${BASE_URL}/stats/rules/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;
export const TOPICS_FETCH_URL = `${BASE_URL}/topic/`;
export const SYSTEMS_FETCH_URL = `${BASE_URL}/system/`;

export const SYSTEM_TYPES = { rhel: 105, ocp: 325 };
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
export const FILTER_CATEGORIES = [
    {
        type: 'checkbox', title: intlHelper(intl.formatMessage(messages.totalRisk), intlSettings), urlParam: 'total_risk', values: [
            { label: intlHelper(intl.formatMessage(messages.critical), intlSettings), value: '4' },
            { label: intlHelper(intl.formatMessage(messages.important), intlSettings), value: '3' },
            { label: intlHelper(intl.formatMessage(messages.moderate), intlSettings), value: '2' },
            { label: intlHelper(intl.formatMessage(messages.low), intlSettings), value: '1' }
        ]
    }, {
        type: 'checkbox', title: intlHelper(intl.formatMessage(messages.riskofchange), intlSettings), urlParam: 'res_risk', values: [
            { label: intlHelper(intl.formatMessage(messages.high), intlSettings), value: '4' },
            { label: intlHelper(intl.formatMessage(messages.moderate), intlSettings), value: '3' },
            { label: intlHelper(intl.formatMessage(messages.low), intlSettings), value: '2' },
            { label: intlHelper(intl.formatMessage(messages.veryLow), intlSettings), value: '1' }
        ]
    },
    {
        type: 'checkbox', title: intlHelper(intl.formatMessage(messages.impact), intlSettings), urlParam: 'impact', values: [
            { label: intlHelper(intl.formatMessage(messages.critical), intlSettings), value: '4' },
            { label: intlHelper(intl.formatMessage(messages.important), intlSettings), value: '3' },
            { label: intlHelper(intl.formatMessage(messages.moderate), intlSettings), value: '2' },
            { label: intlHelper(intl.formatMessage(messages.low), intlSettings), value: '1' }
        ]
    },
    {
        type: 'checkbox', title: intlHelper(intl.formatMessage(messages.likelihood), intlSettings), urlParam: 'likelihood', values: [
            { label: intlHelper(intl.formatMessage(messages.critical), intlSettings), value: '4' },
            { label: intlHelper(intl.formatMessage(messages.important), intlSettings), value: '3' },
            { label: intlHelper(intl.formatMessage(messages.moderate), intlSettings), value: '2' },
            { label: intlHelper(intl.formatMessage(messages.low), intlSettings), value: '1' }
        ]
    },
    {
        type: 'checkbox', title: intlHelper(intl.formatMessage(messages.category), intlSettings), urlParam: 'category', values: [
            { label: intlHelper(intl.formatMessage(messages.availability), intlSettings), value: `${RULE_CATEGORIES.availability}` },
            { label: intlHelper(intl.formatMessage(messages.performance), intlSettings), value: `${RULE_CATEGORIES.performance}` },
            { label: intlHelper(intl.formatMessage(messages.stability), intlSettings), value: `${RULE_CATEGORIES.stability}` },
            { label: intlHelper(intl.formatMessage(messages.security), intlSettings), value: `${RULE_CATEGORIES.security}` }
        ]
    },
    {
        type: 'radio', title: intlHelper(intl.formatMessage(messages.ruleStatus), intlSettings), urlParam: 'reports_shown', values: [
            { label: intlHelper(intl.formatMessage(messages.all), intlSettings), value: undefined },
            { label: intlHelper(intl.formatMessage(messages.enabled), intlSettings), value: true },
            { label: intlHelper(intl.formatMessage(messages.disabled), intlSettings), value: false }
        ]
    }
];
export const RISK_OF_CHANGE_DESC = {
    1: intlHelper(intl.formatMessage(messages.riskOfChangeTextOne), intlSettings),
    2: intlHelper(intl.formatMessage(messages.riskOfChangeTextTwo), intlSettings),
    3: intlHelper(intl.formatMessage(messages.riskOfChangeTextThree), intlSettings),
    4: intlHelper(intl.formatMessage(messages.riskOfChangeTextFour), intlSettings)
};
export const IMPACT_LABEL = {
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    3: intlHelper(intl.formatMessage(messages.important), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const LIKELIHOOD_LABEL = {
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    3: intlHelper(intl.formatMessage(messages.important), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const RISK_OF_CHANGE_LABEL = {
    1: intlHelper(intl.formatMessage(messages.veryLow), intlSettings),
    2: intlHelper(intl.formatMessage(messages.low), intlSettings),
    3: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    4: intlHelper(intl.formatMessage(messages.high), intlSettings)
};
export const TOTAL_RISK_LABEL = {
    1: 'Low',
    2: 'Moderate',
    3: 'Important',
    4: 'Critical'
};
