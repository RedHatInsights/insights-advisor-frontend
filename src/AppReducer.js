import Immutable from 'seamless-immutable';
import * as ActionTypes from './AppConstants';

// eslint-disable-next-line new-cap
const initialState = Immutable({
    criticalRiskRules: {},
    criticalRiskRulesFetchStatus: '',
    highRiskRules: {},
    highRiskRulesFetchStatus: '',
    mediumRiskRules: {},
    mediumRiskRulesFetchStatus: '',
    lowRiskRules: {},
    impactedSystems: [],
    impactedSystemsFetchStatus: '',
    impactedSystemsRules: {},
    impactedSystemsRulesFetchStatus: ''

});

export const AdvisorStore = (state = initialState, action) => {
    switch (action.type) {

        case `${ActionTypes.MEDIUM_RISK_RULES_FETCH}_PENDING`:
            return state.set('mediumRiskRulesFetchStatus', 'pending');
        case `${ActionTypes.MEDIUM_RISK_RULES_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                mediumRiskRules: action.payload,
                mediumRiskRulesFetchStatus: 'fulfilled' });
        case `${ActionTypes.MEDIUM_RISK_RULES_FETCH}_REJECTED`:
            return state.set('mediumRiskRulesFetchStatus', 'fulfilled');

        case `${ActionTypes.IMPACTED_SYSTEMS_FETCH}_PENDING`:
            return state.set('impactedSystemsFetchStatus', 'pending');
        case `${ActionTypes.IMPACTED_SYSTEMS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                impactedSystems: action.payload.resources,
                impactedSystemsFetchStatus: 'fulfilled' });
        case `${ActionTypes.IMPACTED_SYSTEMS_FETCH}_REJECTED`:
            return state.set('impactedSystemsFetchStatus', 'fulfilled');

        default:
            return state;
    }
};
