import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { AdvisorStore } from '../AppReducer';

let registry;

class ReducerRegistry {
    constructor(initState = {}, middlewares = [], composeEnhancersDefault = compose) {
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeEnhancersDefault;
        this.store = createStore(
            (state = initState) => state,
            initState,
            composeEnhancers(applyMiddleware(...middlewares))
        );
        this.reducers = {};
    }

    on(event, callback) {
        this.listenerMiddleware.addNew({ on: event, callback });
    }

    getListenerMiddleware() {
        return this.listenerMiddleware;
    }

    getStore() {
        return this.store;
    }

    /**
     * Adds new reducers to the store
     *
     * @param newReducers the object of new reducers.
     */
    register(newReducers) {
        this.reducers = { ...this.reducers, ...newReducers };
        this.store.replaceReducer(combineReducers({ ...this.reducers }));
    }
}

export function init (...middleware) {
    if (registry) {
        throw new Error('store already initialized');
    }

    registry = new ReducerRegistry({}, [
        promiseMiddleware(),
        ...middleware
    ]);

    registry.register({ AdvisorStore });

    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}
