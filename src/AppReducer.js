import * as ActionTypes from './AppConstants';

import Advisor from '@redhat-cloud-services/frontend-components-inventory-insights';
/* eslint camelcase: 0 */
import Immutable from 'seamless-immutable';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';

// eslint-disable-next-line new-cap
const initialState = Immutable({
    rule: {},
    ruleFetchStatus: '',
    rules: {},
    rulesFetchStatus: '',
    statsRules: {},
    statsRulesFetchStatus: '',
    statsSystems: {},
    statsSystemsFetchStatus: '',
    system: {},
    systemFetchStatus: '',
    systemtype: {},
    systemtypeFetchStatus: '',
    filters: { impacting: true, reports_shown: 'true' },
    topic: {},
    topicFetchStatus: '',
    topics: [],
    topicsFetchStatus: '',
    systems: {},
    systemsFetchStatus: '',
    ruleAck: {},
    ruleAckFetchStatus: ''
});

export const AdvisorStore = (state = initialState, action) => {
    switch (action.type) {
        case `${ActionTypes.RULE_FETCH}_PENDING`:
            return state.set('ruleFetchStatus', 'pending');
        case `${ActionTypes.RULE_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                rule: action.payload,
                ruleFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.RULE_FETCH}_REJECTED`:
            return state.set('ruleFetchStatus', 'rejected');

        case `${ActionTypes.RULES_FETCH}_PENDING`:
            return state.set('rulesFetchStatus', 'pending');
        case `${ActionTypes.RULES_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                rules: action.payload,
                rulesFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.RULES_FETCH}_REJECTED`:
            return state.set('rulesFetchStatus', 'rejected');

        case `${ActionTypes.STATS_RULES_FETCH}_PENDING`:
            return state.set('statsRulesFetchStatus', 'pending');
        case `${ActionTypes.STATS_RULES_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                statsRules: action.payload,
                statsRulesFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.STATS_RULES_FETCH}_REJECTED`:
            return state.set('statsRulesFetchStatus', 'rejected');

        case `${ActionTypes.STATS_SYSTEMS_FETCH}_PENDING`:
            return state.set('statsSystemsFetchStatus', 'pending');
        case `${ActionTypes.STATS_SYSTEMS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                statsSystems: action.payload,
                statsSystemsFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.STATS_SYSTEMS_FETCH}_REJECTED`:
            return state.set('statsSystemsFetchStatus', 'rejected');

        case `${ActionTypes.SYSTEM_FETCH}_PENDING`:
            return state.set('systemFetchStatus', 'pending');
        case `${ActionTypes.SYSTEM_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                system: action.payload,
                systemFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.SYSTEM_FETCH}_REJECTED`:
            return state.set('systemFetchStatus', 'rejected');

        case `${ActionTypes.SYSTEMTYPE_FETCH}_PENDING`:
            return state.set('systemtypeFetchStatus', 'pending');
        case `${ActionTypes.SYSTEMTYPE_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                systemtype: action.payload,
                systemtypeFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.SYSTEMTYPE_FETCH}_REJECTED`:
            return state.set('systemFetchStatus', 'rejected');

        case ActionTypes.FILTERS_SET:
            return Immutable.merge(state, {
                filters: action.payload
            });

        case `${ActionTypes.TOPIC_FETCH}_PENDING`:
            return state.set('topicFetchStatus', 'pending');
        case `${ActionTypes.TOPIC_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                topic: action.payload,
                topicFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.TOPIC_FETCH}_REJECTED`:
            return state.set('topicFetchStatus', 'rejected');

        case `${ActionTypes.TOPICS_FETCH}_PENDING`:
            return state.set('topicsFetchStatus', 'pending');
        case `${ActionTypes.TOPICS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                topics: action.payload,
                topicsFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.TOPICS_FETCH}_REJECTED`:
            return state.set('topicsFetchStatus', 'rejected');

        case `${ActionTypes.SYSTEMS_FETCH}_PENDING`:
            return state.set('systemsFetchStatus', 'pending');
        case `${ActionTypes.SYSTEMS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                systems: action.payload,
                systemsFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.SYSTEMS_FETCH}_REJECTED`:
            return state.set('systemsFetchStatus', 'rejected');

        case `${ActionTypes.RULE_ACK_FETCH}_PENDING`:
            return state.set('ruleAckFetchStatus', 'pending');
        case `${ActionTypes.RULE_ACK_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                ruleAck: action.payload,
                ruleAckFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.RULE_ACK_FETCH}_REJECTED`:
            return state.set('ruleAckFetchStatus', 'rejected');

        case ActionTypes.RULE_ACK_SET:
            return Immutable.merge(state, {
                ruleAck: action.payload
            });

        default:
            return state;
    }
};

export function entitiesDetailsReducer(ActionTypes) {
    return applyReducerHash(
        {
            [`${ActionTypes.LOAD_ENTITY}_FULFILLED`]: enableApplications
        },
        {}
    );
}

function enableApplications(state) {
    return {
        ...state,
        loaded: true,
        activeApps: [
            { title: 'Insights', name: 'insights', component: Advisor }
        ]
    };
}
