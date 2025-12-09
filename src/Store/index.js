import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { entitiesDetailsReducer, systemReducer } from './AppReducer';

import { Acks } from '../Services/Acks';
import { Pathways } from '../Services/Pathways';
import { Recs } from '../Services/Recs';
import { Systems } from '../Services/Systems';
import { Topics } from '../Services/Topics';
import filters from '../Services/Filters';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import promiseMiddleware from 'redux-promise-middleware';
import { SystemVariety } from '../Services/SystemVariety';

const reducer = {
  [Pathways.reducerPath]: Pathways.reducer,
  [Recs.reducerPath]: Recs.reducer,
  [Topics.reducerPath]: Topics.reducer,
  [Systems.reducerPath]: Systems.reducer,
  [Acks.reducerPath]: Acks.reducer,
  [SystemVariety.reducerPath]: SystemVariety.reducer,
  filters,
  notifications: notificationsReducer,
  systemReducer: systemReducer([], {}),
  entitiesDetailsReducer: entitiesDetailsReducer({}),
};

const getMiddlewares = (appMiddlewares) => {
  const middlewares = [
    promiseMiddleware,
    Pathways.middleware,
    Recs.middleware,
    Systems.middleware,
    Topics.middleware,
    Acks.middleware,
    SystemVariety.middleware,
    notificationsMiddleware({
      errorTitleKey: ['message'],
      errorDescriptionKey: ['response.data.detail'],
    }),
    ...appMiddlewares,
  ];

  return (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'LOAD_ENTITIES',
          'LOAD_ENTITY',
          'CLEAR_FILTERS',
          'LOAD_ENTITY_FULFILLED',
          'LOAD_ENTITIES_FULFILLED',
        ],
      },
      immutableCheck: {
        ignoredPaths: ['entities'],
      },
    }).concat(
      ...middlewares.filter((middleware) => typeof middleware !== 'undefined'),
    );
};

const initStore = (appMiddlewares = []) =>
  configureStore({
    reducer,
    middleware: getMiddlewares(appMiddlewares),
  });

const updateReducers = (newReducers = {}) =>
  combineReducers({
    ...reducer,
    ...newReducers,
  });

export { initStore, updateReducers };
