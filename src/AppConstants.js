export const RULE_FETCH = 'RULE_FETCH';
export const RULES_FETCH = 'RULES_FETCH';
export const SYSTEM_FETCH = 'SYSTEM_FETCH';
export const SYSTEMTYPE_FETCH = 'SYSTEMTYPE_FETCH';
export const MEDIUM_RISK_RULES_FETCH = 'MEDIUM_RISK_RULES_FETCH';
export const IMPACTED_SYSTEMS_FETCH = 'IMPACTED_SYSTEMS_FETCH';
export const STATS_FETCH = 'STATS_FETCH';
export const BREADCRUMBS_SET = 'BREADCRUMBS_SET';

const BASE_URL = process.env.IS_DEV ? '/r/insights/platform/advisor/v1' : '';
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_FETCH_URL = `${BASE_URL}/stats/`;
export const SYSTEM_FETCH_URL = `${BASE_URL}/system/`;
export const SYSTEMTYPE_FETCH_URL = `${BASE_URL}/systemtype/`;
