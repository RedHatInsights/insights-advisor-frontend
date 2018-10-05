import promiseMiddleware from 'redux-promise-middleware';
import { AdvisorStore } from '../AppReducer';
import { compose } from 'redux';
import { getRegistry } from '@red-hat-insights/insights-frontend-components';
let registry;

export function init (...middleware) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    registry = getRegistry(
        {},
        [ ...middleware, promiseMiddleware() ],
        composeEnhancers
    );

    registry.register({ AdvisorStore });

    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}
