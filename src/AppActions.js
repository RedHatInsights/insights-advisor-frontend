import * as ActionTypes from './AppConstants';

import API from './Utilities/Api';

const fetchData = async (url, headers, options, search) => {
  await insights.chrome.auth.getUser();
  const response = search
    ? await API.get(`${url}?${search}`, headers, options)
    : await API.get(`${url}`, headers, options);
  return response.data;
};

const setData = async (url, headers, options) => {
  await insights.chrome.auth.getUser();
  const response = await API.post(url, headers, options);
  return response.data;
};

export const fetchStatsRules = (options) => ({
  type: ActionTypes.STATS_RULES_FETCH,
  payload: fetchData(ActionTypes.STATS_RULES_FETCH_URL, {}, options),
});
export const fetchStatsSystems = (options) => ({
  type: ActionTypes.STATS_SYSTEMS_FETCH,
  payload: fetchData(ActionTypes.STATS_SYSTEMS_FETCH_URL, {}, options),
});
export const fetchStatsStaleHosts = (options) => ({
  type: ActionTypes.STATS_STALEHOSTS_FETCH,
  payload: fetchData(ActionTypes.STATS_STALEHOSTS_FETCH_URL, {}, options),
});

let rulesPromises = [];
export const fetchRules = (options, search) => {
  rulesPromises.push(
    fetchData(ActionTypes.RULES_FETCH_URL, {}, options, search && search)
  );
  return {
    type: ActionTypes.RULES_FETCH,
    payload: Promise.all(rulesPromises).then((results) => {
      rulesPromises = [];
      return results.pop();
    }),
  };
};

export const fetchRule = (options, search) => ({
  type: ActionTypes.RULE_FETCH,
  payload: fetchData(
    `${ActionTypes.RULES_FETCH_URL}${options.rule_id}/`,
    {},
    options,
    search && search
  ),
});
export const fetchSystem = (ruleId, options, search) => ({
  type: ActionTypes.SYSTEM_FETCH,
  payload: fetchData(
    `${ActionTypes.RULES_FETCH_URL}${encodeURI(ruleId)}/systems`,
    {},
    options,
    search && search
  ),
});
export const setFilters = (filters) => ({
  type: ActionTypes.FILTERS_SET,
  payload: filters,
});
export const fetchTopics = (options) => ({
  type: ActionTypes.TOPICS_FETCH,
  payload: fetchData(ActionTypes.TOPICS_FETCH_URL, {}, options),
});
export const fetchTopicsAdmin = () => ({
  type: ActionTypes.TOPICS_FETCH,
  payload: fetchData(`${ActionTypes.TOPICS_FETCH_URL}?show_disabled=true`),
});
export const fetchTopic = (options) => ({
  type: ActionTypes.TOPIC_FETCH,
  payload: fetchData(`${ActionTypes.TOPICS_FETCH_URL}${options.topic_id}/`),
});
export const fetchSystems = (options) => ({
  type: ActionTypes.SYSTEMS_FETCH,
  payload: fetchData(ActionTypes.SYSTEMS_FETCH_URL, {}, options),
});
export const fetchRuleAck = (options) => ({
  type: ActionTypes.RULE_ACK_FETCH,
  payload: fetchData(`${ActionTypes.RULE_ACK_URL}${options.rule_id}/`),
});
export const setAck = (options) => ({
  type: ActionTypes[`${options.type}_ACK_SET`],
  payload: setData(ActionTypes[`${options.type}_ACK_URL`], {}, options.options),
});
export const fetchHostAcks = (options) => ({
  type: ActionTypes.HOST_ACK_FETCH,
  payload: fetchData(`${ActionTypes.HOST_ACK_URL}`, {}, options),
});
export const setFiltersSystems = (filters) => ({
  type: ActionTypes.FILTERS_SYSTEMS_SET,
  payload: filters,
});
export const setSelectedTags = (tags) => ({
  type: ActionTypes.SELECTED_TAGS_SET,
  payload: tags,
});
export const setRule = (rule) => ({
  type: ActionTypes.RULE_SET,
  payload: rule,
});
export const setSystem = (system) => ({
  type: ActionTypes.SYSTEM_SET,
  payload: system,
});
export const setWorkloads = (data) => ({
  type: ActionTypes.WORKLOADS_SET,
  payload: data,
});

export const setSIDs = (data) => ({
  type: ActionTypes.SID_SET,
  payload: data,
});
