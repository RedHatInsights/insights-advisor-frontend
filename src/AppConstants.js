export const RULE_FETCH = 'RULE_FETCH';
export const RULES_FETCH = 'RULES_FETCH';
export const SYSTEM_FETCH = 'SYSTEM_FETCH';
export const SYSTEMTYPE_FETCH = 'SYSTEMTYPE_FETCH';
export const STATS_FETCH = 'STATS_FETCH';
export const BREADCRUMBS_SET = 'BREADCRUMBS_SET';
export const LOAD_ENTITY = 'LOAD_ENTITY';
export const FILTERS_SET = 'FILTERS_SET';

const BASE_URL = '/r/insights/platform/advisor/v1';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_FETCH_URL = `${BASE_URL}/stats/`;
export const SYSTEM_FETCH_URL = `${BASE_URL}/system/`;

export const SYSTEM_TYPES = { rhel: 105 };
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
        title: 'Total Risk', urlParam: 'total_risk', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        title: 'Impact', urlParam: 'impact', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        title: 'Likelihood', urlParam: 'likelihood', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        title: 'Category', urlParam: 'category', values: [
            { label: 'Availability', value: `${RULE_CATEGORIES.availability}` },
            { label: 'Performance', value: `${RULE_CATEGORIES.performance}` },
            { label: 'Stability', value: `${RULE_CATEGORIES.stability}` },
            { label: 'Security', value: `${RULE_CATEGORIES.security}` }
        ]
    }
];
export const RISK_OF_CHANGE_LABEL = [ 'Very Low', 'Low', 'Moderate', 'High' ];
export const RISK_OF_CHANGE_DESC = [
    'The change takes very little time to implement and there is minimal impact to system operations. These are typically configuration changes that do not impact a running kernel or service. These changes can be made by modifying a line or file; the change that is taken is immediate and does not impact the system itself.',
    'Typically, these changes do not require that a system be taken offline. They are safe to make and even if executed incorrectly, will still leave the systemin a usable state.',
    'These will likely require an outage window. If these changes are executed incorrectly, they can leave the system in a severely degraded state.',
    'The change takes a significant amount of time and planning to execute, and will impact the system and business operations of the host due to downtime.'
];
export const TOTAL_RISK_LABEL = [ 'Very Low', 'Low', 'Moderate', 'High' ];
export const TOTAL_RISK_DESC = [
    'Very low Total Risk description.',
    'Low Total Risk description.',
    'Moderate Total Risk description.',
    'The likelihood that this will be a problem is low. The impact of the problem would be critical if it occurred.'
];

