/* eslint-disable max-len */
/* eslint-disable camelcase */
import { createIntl, createIntlCache } from 'react-intl';

import { Battery } from '@redhat-cloud-services/frontend-components/components/Battery';
import React from 'react';
import { Shield } from '@redhat-cloud-services/frontend-components/components/Shield';
import { intlHelper } from '@redhat-cloud-services/frontend-components-translations';
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
export const FILTERS_SET = 'FILTERS_SET';
export const TOPIC_FETCH = 'TOPIC_FETCH';
export const TOPICS_FETCH = 'TOPICS_FETCH';
export const SYSTEMS_FETCH = 'SYSTEMS_FETCH';
export const RULE_ACK_FETCH = 'RULE_ACK_FETCH';
export const RULE_ACK_SET = 'RULE_ACK_SET';
export const HOST_ACK_FETCH = 'HOST_ACK_FETCH';
export const HOST_ACK_SET = 'HOST_ACK_SET';
export const FILTERS_SYSTEMS_SET = 'FILTERS_SYSTEMS_SET';

export const BASE_URL = '/api/insights/v1';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_RULES_FETCH_URL = `${BASE_URL}/stats/rules/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;
export const TOPICS_FETCH_URL = `${BASE_URL}/topic/`;
export const SYSTEMS_FETCH_URL = `${BASE_URL}/system/`;
export const RULE_ACK_URL = `${BASE_URL}/ack/`;
export const HOST_ACK_URL = `${BASE_URL}/hostack/`;

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
    1: intlHelper(intl.formatMessage(messages.low), intlSettings),
    2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
    3: intlHelper(intl.formatMessage(messages.important), intlSettings),
    4: intlHelper(intl.formatMessage(messages.critical), intlSettings)
};
export const FILTER_CATEGORIES = {
    total_risk: {
        type: 'checkbox', title: 'Total risk', urlParam: 'total_risk', values: [
            { label: <Battery label={TOTAL_RISK_LABEL[4]} severity={4} />, text: TOTAL_RISK_LABEL[4], value: '4' },
            { label: <Battery label={TOTAL_RISK_LABEL[3]} severity={3} />, text: TOTAL_RISK_LABEL[3], value: '3' },
            { label: <Battery label={TOTAL_RISK_LABEL[2]} severity={2} />, text: TOTAL_RISK_LABEL[2], value: '2' },
            { label: <Battery label={TOTAL_RISK_LABEL[1]} severity={1} />, text: TOTAL_RISK_LABEL[1], value: '1' }
        ]
    },
    res_risk: {
        type: 'checkbox', title: 'Risk of change', urlParam: 'res_risk', values: [
            { label: <React.Fragment><Shield hasTooltip={false} impact={4} size={'sm'} title={RISK_OF_CHANGE_LABEL[4]} />{RISK_OF_CHANGE_LABEL[4]}</React.Fragment>, text: RISK_OF_CHANGE_LABEL[4], value: '4' },
            { label: <React.Fragment><Shield hasTooltip={false} impact={3} size={'sm'} title={RISK_OF_CHANGE_LABEL[3]} />{RISK_OF_CHANGE_LABEL[3]}</React.Fragment>, text: RISK_OF_CHANGE_LABEL[3], value: '3' },
            { label: <React.Fragment><Shield hasTooltip={false} impact={2} size={'sm'} title={RISK_OF_CHANGE_LABEL[2]} />{RISK_OF_CHANGE_LABEL[2]}</React.Fragment>, text: RISK_OF_CHANGE_LABEL[2], value: '2' },
            { label: <React.Fragment><Shield hasTooltip={false} impact={1} size={'sm'} title={RISK_OF_CHANGE_LABEL[1]} />{RISK_OF_CHANGE_LABEL[1]}</React.Fragment>, text: RISK_OF_CHANGE_LABEL[1], value: '1' }
        ]
    },
    impact: {
        type: 'checkbox', title: 'Impact', urlParam: 'impact', values: [
            { label: IMPACT_LABEL[4], value: '4' },
            { label: IMPACT_LABEL[3], value: '3' },
            { label: IMPACT_LABEL[2], value: '2' },
            { label: IMPACT_LABEL[1], value: '1' }
        ]
    },
    likelihood: {
        type: 'checkbox', title: 'Likelihood', urlParam: 'likelihood', values: [
            { label: LIKELIHOOD_LABEL[4], value: '4' },
            { label: LIKELIHOOD_LABEL[3], value: '3' },
            { label: LIKELIHOOD_LABEL[2], value: '2' },
            { label: LIKELIHOOD_LABEL[1], value: '1' }
        ]
    },
    category: {
        type: 'checkbox', title: 'Category', urlParam: 'category', values: [
            { label: intlHelper(intl.formatMessage(messages.availability), intlSettings), value: `${RULE_CATEGORIES.availability}` },
            { label: intlHelper(intl.formatMessage(messages.performance), intlSettings), value: `${RULE_CATEGORIES.performance}` },
            { label: intlHelper(intl.formatMessage(messages.stability), intlSettings), value: `${RULE_CATEGORIES.stability}` },
            { label: intlHelper(intl.formatMessage(messages.security), intlSettings), value: `${RULE_CATEGORIES.security}` }
        ]
    },
    incident: {
        type: 'checkbox', title: 'Incident rules', urlParam: 'incident', values: [
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
    reports_shown: {
        type: 'radio', title: 'Rule status', urlParam: 'reports_shown', values: [
            { label: intlHelper(intl.formatMessage(messages.all), intlSettings), value: 'undefined' },
            { label: intlHelper(intl.formatMessage(messages.enabled), intlSettings), value: 'true' },
            { label: intlHelper(intl.formatMessage(messages.disabled), intlSettings), value: 'false' }
        ]
    }
};
