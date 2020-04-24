/* eslint camelcase: 0 */
import * as ActionTypes from './AppConstants';

import Advisor from '@redhat-cloud-services/frontend-components-inventory-insights';
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
    statsStaleHosts: {},
    statsStaleHostsFetchStatus: '',
    system: {},
    systemFetchStatus: '',
    systemtype: {},
    systemtypeFetchStatus: '',
    filters: { impacting: true, reports_shown: 'true', sort: '-total_risk', limit: 10, offset: 0 },
    filtersSystems: { sort: '-last_seen' },
    topic: {},
    topicFetchStatus: '',
    topics: [],
    topicsFetchStatus: '',
    systems: {},
    systemsFetchStatus: '',
    ruleAck: {},
    ruleAckFetchStatus: '',
    hostAcks: {},
    hostAcksFetchStatus: '',
    selectedTags: []
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

        case `${ActionTypes.STATS_STALEHOSTS_FETCH}_PENDING`:
            return state.set('statsStaleHostsFetchStatus', 'pending');
        case `${ActionTypes.STATS_STALEHOSTS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                statsStaleHosts: action.payload,
                statsStaleHostsFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.STATS_STALEHOSTS_FETCH}_REJECTED`:
            return state.set('statsStaleHostsFetchStatus', 'rejected');

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

        case `${ActionTypes.HOST_ACK_FETCH}_PENDING`:
            return state.set('hostAcksFetchStatus', 'pending');
        case `${ActionTypes.HOST_ACK_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                hostAcks: action.payload,
                hostAcksFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.HOST_ACK_FETCH}_REJECTED`:
            return state.set('hostAcksFetchStatus', 'rejected');

        case ActionTypes.FILTERS_SYSTEMS_SET:
            return Immutable.merge(state, {
                filtersSystems: action.payload
            });

        case ActionTypes.SELECTED_TAGS_SET:
            return Immutable.merge(state, {
                selectedTags: action.payload
            });

        case ActionTypes.RULE_SET:
            return Immutable.merge(state, {
                rule: action.payload
            });

        case ActionTypes.SYSTEM_SET:
            return Immutable.merge(state, {
                system: action.payload
            });

        default:
            return state;
    }
};

export function systemReducer(cols, INVENTORY_ACTION_TYPES) {
    return applyReducerHash({
        [`${INVENTORY_ACTION_TYPES.LOAD_ENTITIES}_FULFILLED`]: (state) => {
            const { [state.columns.length - 1]: lastCol } = state.columns;
            cols[cols.length - 1] = {
                ...lastCol,
                ...cols[cols.length - 1]
            };
            return {
                ...state,
                columns: cols.map(cell => ({
                    ...cell,
                    ...state.columns.find(({ key }) => cell.key === key)
                }))
            };
        }
    });
}

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
