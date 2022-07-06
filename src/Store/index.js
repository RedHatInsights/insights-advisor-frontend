import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { entitiesDetailsReducer, systemReducer } from './AppReducer';

// This "Services" should be in here under "Store"
import { Acks } from '../Services/Acks';
import { Pathways } from '../Services/Pathways';
import { Recs } from '../Services/Recs';
import { Systems } from '../Services/Systems';
import { Topics } from '../Services/Topics';
import filters from '../Services/Filters';
import logger from 'redux-logger';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import promiseMiddleware from 'redux-promise-middleware';

const env = 'development';
const production = env !== 'production';
const reducer = {
  [Pathways.reducerPath]: Pathways.reducer,
  [Recs.reducerPath]: Recs.reducer,
  [Topics.reducerPath]: Topics.reducer,
  [Systems.reducerPath]: Systems.reducer,
  [Acks.reducerPath]: Acks.reducer,
  filters,
  notifications: notificationsReducer,
  systemReducer: systemReducer([], {}),
  entitiesDetailsReducer: entitiesDetailsReducer({}),
};

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        'LOAD_ENTITIES',
        'LOAD_ENTITY',
        'CLEAR_FILTERS',
        'LOAD_ENTITY_FULFILLED',
      ],
    },
    immutableCheck: {
      ignoredPaths: ['entities'],
    },
  }).concat(
    promiseMiddleware,
    Pathways.middleware,
    Recs.middleware,
    Systems.middleware,
    Topics.middleware,
    Acks.middleware,
    notificationsMiddleware({
      errorTitleKey: ['message'],
      errorDescriptionKey: ['response.data.detail'],
    }),
    production && logger
  );

const getStore = () => {
  return configureStore({
    reducer,
    middleware,
    devTools: production,
  });
};

const updateReducers = (newReducers = {}) =>
  combineReducers({
    ...reducer,
    ...newReducers,
  });

export { getStore, updateReducers };
