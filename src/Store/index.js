import {
  notifications,
  notificationsMiddleware,
} from '@redhat-cloud-services/frontend-components-notifications/';

import { compose } from 'redux';
// import { Pathways } from '../Services/Pathways';
// import { configureStore } from '@reduxjs/toolkit';
import { getAdvisorStore } from './AppReducer';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
// import logger from 'redux-logger';
import promiseMiddleware from 'redux-promise-middleware';

let registry;

const localStorage = (store) => (next) => (action) => {
  next(action);
  const activeStore = store.getState().AdvisorStore;
  sessionStorage.setItem('AdvisorStore', JSON.stringify(activeStore));
};

export function init(...middleware) {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  registry = getRegistry(
    {},
    [
      ...middleware,
      promiseMiddleware,
      notificationsMiddleware({
        errorTitleKey: ['message'],
        errorDescriptionKey: ['response.data.detail'],
      }),
      localStorage,
    ],
    composeEnhancers
  );

  const previousAdvisorStore = JSON.parse(
    sessionStorage.getItem('AdvisorStore')
  );
  registry.register({ AdvisorStore: getAdvisorStore(previousAdvisorStore) });
  registry.register({ notifications });

  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}

// const getStore = () => {
//   const reducer = {
//     [Pathways.reducerPath]: Pathways.reducer,
//   };

//   return configureStore({
//     reducer,
//     middleware: (getDefaultMiddleware) => {
//       const middleware = getDefaultMiddleware({
//         // serializableCheck: false,
//       });
//       if (process.env.NODE_ENV !== 'production') {
//         middleware.concat(logger);
//       }

//       middleware.concat(Pathways.middleware);

//       return middleware;
//     },
//     devTools: process.env.NODE_ENV !== 'production',
//   });
// };

// export { getStore };
