import * as ActionTypes from './AppConstants';
import API from './Utilities/Api';

import impactedSystemsData from '../mockData/actions-types-ids_impacted-systems';
import mediumRiskRulesData from '../mockData/medium-risk';

const impactedSystems = () => JSON.parse(JSON.stringify(impactedSystemsData));
const mediumRiskRules = () => JSON.parse(JSON.stringify(mediumRiskRulesData));

export const fetchImpactedSystems = ()  => ({
    type: ActionTypes.IMPACTED_SYSTEMS_FETCH,
    payload: new Promise(resolve => {
        resolve(impactedSystems);
    })
});
export const fetchMediumRiskRules = ()  => ({
    type: ActionTypes.MEDIUM_RISK_RULES_FETCH,
    payload: new Promise(resolve => {
        resolve(mediumRiskRules);
    })
});
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
