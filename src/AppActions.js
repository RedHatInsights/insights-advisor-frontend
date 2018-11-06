import * as ActionTypes from './AppConstants';
import API from './Utilities/Api';

const fetchData = async (url, headers, options) => (await API.get(url, headers, options)).data;
const notificationGenerator = type => ({
    notifications: {
        rejected: {
            variant: 'danger',
            title: `Sorry, ${type} fetch has failed.`,
            dismissable: true
        }
    }
});

export const fetchStats = () => ({
    type: ActionTypes.STATS_FETCH,
    payload: fetchData(ActionTypes.STATS_FETCH_URL),
    meta: notificationGenerator('Stats')
});
export const fetchRules = (options) => ({
    type: ActionTypes.RULES_FETCH,
    payload: fetchData(ActionTypes.RULES_FETCH_URL, {}, options),
    meta: notificationGenerator('Rules')

});
export const fetchRule = (options) => ({
    type: ActionTypes.RULE_FETCH,
    payload: fetchData(`${ActionTypes.RULES_FETCH_URL}${options.rule_id}/`),
    meta: notificationGenerator('Rule')

});
export const setBreadcrumbs = (breadcrumbObj) => ({
    type: ActionTypes.BREADCRUMBS_SET,
    payload: breadcrumbObj
});
