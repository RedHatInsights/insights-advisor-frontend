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
