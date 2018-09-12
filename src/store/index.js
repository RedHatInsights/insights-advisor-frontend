import { applyMiddleware, combineReducers, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { compose } from 'redux';
import { logger } from 'redux-logger';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(f => f, composeEnhancers(applyMiddleware(promiseMiddleware(), logger)));

class ReducerRegistry {
    constructor() {
        this.reducers = {} ;
    }

    getStore() {
        return store;
    }

    changeListener(reducers) {
        store.replaceReducer(combineReducers({ ...this.reducers, ...reducers }));
    }

    register(newReducers) {
        this.reducers = { ...this.reducers, ...newReducers };
        this.changeListener(this.reducers);
    }
}

export default new ReducerRegistry();
