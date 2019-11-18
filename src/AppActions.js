import * as ActionTypes from './AppConstants';

import API from './Utilities/Api';

const fetchData = async (url, headers, options) => {
    await insights.chrome.auth.getUser();
    const response = await API.get(url, headers, options);
    return response.data;
};

const setData = async (url, headers, options) => {
    await insights.chrome.auth.getUser();
    const response = await API.post(url, headers, options);
    return response.data;
};

export const fetchStatsRules = () => ({
    type: ActionTypes.STATS_RULES_FETCH,
    payload: fetchData(ActionTypes.STATS_RULES_FETCH_URL)
});
export const fetchStatsSystems = () => ({
    type: ActionTypes.STATS_SYSTEMS_FETCH,
    payload: fetchData(ActionTypes.STATS_SYSTEMS_FETCH_URL)
});
export const fetchRules = (options) => ({
    type: ActionTypes.RULES_FETCH,
    payload: fetchData(ActionTypes.RULES_FETCH_URL, {}, options)
});
export const fetchRule = (options) => ({
    type: ActionTypes.RULE_FETCH,
    payload: fetchData(`${ActionTypes.RULES_FETCH_URL}${options.rule_id}/`)
});
export const fetchSystem = (options) => ({
    type: ActionTypes.SYSTEM_FETCH,
    payload: fetchData(`${ActionTypes.RULES_FETCH_URL}${options.rule_id}/systems/`)
});
export const setFilters = (filters) => ({
    type: ActionTypes.FILTERS_SET,
    payload: filters
});
export const fetchTopics = () => ({
    type: ActionTypes.TOPICS_FETCH,
    payload: fetchData(ActionTypes.TOPICS_FETCH_URL)
});
export const fetchTopic = (options) => ({
    type: ActionTypes.TOPIC_FETCH,
    payload: fetchData(`${ActionTypes.TOPICS_FETCH_URL}${options.topic_id}/`)
});
export const fetchSystems = (options) => ({
    type: ActionTypes.SYSTEMS_FETCH,
    payload: fetchData(ActionTypes.SYSTEMS_FETCH_URL, {}, options)
});
export const fetchRuleAck = (options) => ({
    type: ActionTypes.RULE_ACK_FETCH,
    payload: fetchData(`${ActionTypes.RULE_ACK_FETCH_URL}${options.rule_id}/`)
});
export const setRuleAck = (options) => ({
    type: ActionTypes.RULE_ACK_FETCH,
    payload: setData(ActionTypes.RULE_ACK_FETCH_URL, {}, options)
});

