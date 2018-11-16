import promiseMiddleware from 'redux-promise-middleware';
import { compose } from 'redux';
import { getRegistry } from '@red-hat-insights/insights-frontend-components';
import { notifications, notificationsMiddleware } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import { AdvisorStore } from '../AppReducer';

let registry;

export function init (...middleware) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    registry = getRegistry(
        {},
        [ ...middleware, promiseMiddleware(), notificationsMiddleware({ errorDescriptionKey: 'response.data' }) ],
        composeEnhancers
    );

    registry.register({ AdvisorStore });
    registry.register({ notifications });

    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}
