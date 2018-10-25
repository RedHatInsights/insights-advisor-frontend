import * as ActionTypes from './AppConstants';
import API from './Utilities/Api';

export const fetchStats = () => ({
    type: ActionTypes.STATS_FETCH,
    payload: fetchData(ActionTypes.STATS_FETCH_URL)
});
export const fetchRules = (options) => ({
    type: ActionTypes.RULES_FETCH,
    payload: fetchData(ActionTypes.RULES_FETCH_URL, {}, options)
});
export const fetchRule = (options) => ({
    type: ActionTypes.RULE_FETCH,
    payload: fetchData(`${ActionTypes.RULES_FETCH_URL}${options.rule_id}/`)
});
export const setBreadcrumbs = (breadcrumbObj) => ({
    type: ActionTypes.BREADCRUMBS_SET,
    payload: breadcrumbObj
});

async function fetchData(url) {
    const response = await API.get(url);
    return response.data;
}
