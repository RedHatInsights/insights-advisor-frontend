import * as ActionTypes from './AppConstants';
import API from './Utilities/Api';

export const fetchStats = () => ({
    type: ActionTypes.STATS_FETCH,
    payload: new Promise((resolve, reject) => {
        API.get(ActionTypes.STATS_FETCH_URL)
        .then(response => {
            resolve(response.data);
        })
        .catch(e => reject(e));
    })
});
export const fetchRules = (options) => ({
    type: ActionTypes.RULES_FETCH,
    payload: new Promise((resolve, reject) => {
        API.get(ActionTypes.RULES_FETCH_URL, {}, options)
        .then(response => {
            resolve(response.data);
        })
        .catch(e => reject(e));
    })
});
export const fetchRule = (options) => ({
    type: ActionTypes.RULE_FETCH,
    payload: new Promise((resolve, reject) => {
        API.get(`${ActionTypes.RULES_FETCH_URL}${options.rule_id}/`)
        .then(response => {
            resolve(response.data);
        })
        .catch(e => reject(e));
    })
});
export const setBreadcrumbs = (breadcrumbObj) => ({
    type: ActionTypes.BREADCRUMBS_SET,
    payload: breadcrumbObj
});
