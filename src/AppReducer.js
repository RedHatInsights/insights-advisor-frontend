import Immutable from 'seamless-immutable';
import * as ActionTypes from './AppConstants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import { Advisor } from '@red-hat-insights/insights-frontend-components';

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
    breadcrumbs: [],
    filters: {}
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

        case ActionTypes.BREADCRUMBS_SET:
            return Immutable.merge(state, {
                breadcrumbs: action.payload
            });

        case ActionTypes.FILTERS_SET:
            return Immutable.merge(state, {
                filters: action.payload
            });

        default:
            return state;
    }
};

export function entitiesDetailsReducer (ActionTypes) {
    return applyReducerHash(
        {
            [`${ActionTypes.LOAD_ENTITY}_FULFILLED`]: enableApplications
        },
        {}
    );
}

function enableApplications (state) {
    return {
        ...state,
        loaded: true,
        activeApps: [
            { title: 'Insights', name: 'insights', component: Advisor }
        ]
    };
}
