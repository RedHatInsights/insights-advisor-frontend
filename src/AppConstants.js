/* eslint max-len: 0 */
export const RULE_FETCH = 'RULE_FETCH';
export const RULES_FETCH = 'RULES_FETCH';
export const SYSTEM_FETCH = 'SYSTEM_FETCH';
export const SYSTEMTYPE_FETCH = 'SYSTEMTYPE_FETCH';
export const STATS_RULES_FETCH = 'STATS_RULES_FETCH';
export const STATS_SYSTEMS_FETCH = 'STATS_SYSTEMS_FETCH';
export const BREADCRUMBS_SET = 'BREADCRUMBS_SET';
export const FILTERS_SET = 'FILTERS_SET';

export const BASE_URL = '/api/insights/v1';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_RULES_FETCH_URL = `${BASE_URL}/stats/rules/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;

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
        type: 'checkbox', title: 'Total Risk', urlParam: 'total_risk', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        type: 'checkbox', title: 'Impact', urlParam: 'impact', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        type: 'checkbox', title: 'Likelihood', urlParam: 'likelihood', values: [
            { label: 'Critical', value: '4' },
            { label: 'High', value: '3' },
            { label: 'Medium', value: '2' },
            { label: 'Low', value: '1' }
        ]
    },
    {
        type: 'checkbox', title: 'Category', urlParam: 'category', values: [
            { label: 'Availability', value: `${RULE_CATEGORIES.availability}` },
            { label: 'Performance', value: `${RULE_CATEGORIES.performance}` },
            { label: 'Stability', value: `${RULE_CATEGORIES.stability}` },
            { label: 'Security', value: `${RULE_CATEGORIES.security}` }
        ]
    },
    {
        type: 'radio', title: 'Rule Status', urlParam: 'reports_shown', values: [
            { label: 'All', value: undefined },
            { label: 'Enabled', value: true },
            { label: 'Disabled', value: false }
        ]
    }
];
export const RISK_OF_CHANGE_DESC = {
    1: 'The change takes very little time to implement and there is minimal impact to system operations.',
    2: 'Typically, these changes do not require that a system be taken offline.',
    3: 'These will likely require an outage window.',
    4: 'The change takes a significant amount of time and planning to execute, and will impact the system and business operations of the host due to downtime.'
};
export const IMPACT_LABEL = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
export const LIKELIHOOD_LABEL = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
export const RISK_OF_CHANGE_LABEL = { 1: 'Low', 2: 'Moderate', 3: 'Moderate', 4: 'High' };
export const TOTAL_RISK_LABEL = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High' };

export const ANSIBLE_ICON = <svg version="1.1" id="Layer_1" width="18px" height="18px" viewBox="0 0 18 18">
    <path
        d="M7.965,8.47125 L11.480625,11.25 L9.1575,5.50125 L7.965,8.47125 Z M12.6894375,13.483125 C12.605625,13.483125 12.5263125,13.46625 12.4531875,13.4325 C12.380625,13.39875 12.2900625,13.336875 12.200625,13.258125 L7.56,9.511875 L5.99625,13.415625 L4.6575,13.415625 L8.578125,3.96 C8.634375,3.830625 8.713125,3.735 8.814375,3.6675 C8.915625,3.605625 9.028125,3.571875 9.1575,3.571875 C9.275625,3.571875 9.3825,3.605625 9.48375,3.6675 C9.585,3.729375 9.658125,3.830625 9.703125,3.96 L13.291875,12.571875 C13.314375,12.628125 13.33125,12.684375 13.336875,12.729375 C13.3425,12.774375 13.348125,12.81375 13.348125,12.83625 C13.348125,13.021875 13.28625,13.179375 13.1563125,13.303125 C13.0275,13.426875 12.87,13.483125 12.6894375,13.483125 L12.6894375,13.483125 Z M9,0 C7.756875,0 6.586875,0.23625 5.495625,0.703125 C4.404375,1.17 3.4425,1.81125 2.626875,2.626875 C1.81125,3.4425 1.17,4.39875 0.703125,5.495625 C0.23625,6.5925 0,7.756875 0,9 C0,10.243125 0.23625,11.413125 0.703125,12.504375 C1.17,13.595625 1.81125,14.5575 2.626875,15.3675 C3.4425,16.1825625 4.39875,16.824375 5.49,17.29125 C6.58125,17.758125 7.756875,18 9,18 C10.243125,18 11.413125,17.76375 12.504375,17.296875 C13.595625,16.83 14.5575,16.18875 15.3675,15.373125 C16.1825625,14.5575 16.824375,13.60125 17.29125,12.51 C17.758125,11.41875 18,10.243125 18,9 C18,7.756875 17.76375,6.586875 17.296875,5.495625 C16.83,4.404375 16.18875,3.4425 15.373125,2.6325 C14.5575,1.816875 13.60125,1.175625 12.51,0.70875 C11.41875,0.241875 10.243125,0 9,0 L9,0 Z"
        className="st0"/>
</svg>;

