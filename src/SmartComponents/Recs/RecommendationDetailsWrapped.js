import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import OverviewDetails from './Details';

import axios from 'axios';

window.insights = {
  chrome: {
    auth: {
      getUser: () =>
        new Promise((resolve) =>
          resolve({
            identity: {
              user: {},
            },
          }),
        ),
    },
    getUserPermissions: () => Promise.resolve([]),
  },
};
export function responseDataInterceptor(response) {
  if (response.data) {
    return response.data;
  }

  return response;
}
const instance = axios.create({ baseURL: '/insights_cloud/' });
instance.interceptors.response.use(responseDataInterceptor);

const RecommendationDetailsWrapped = (props) => (
  <IntlProvider locale="en" messages={messages}>
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <Provider store={initStore()}>
        <OverviewDetails {...props} axios={instance} />
      </Provider>
    </EnvironmentContext.Provider>
  </IntlProvider>
);

export default RecommendationDetailsWrapped;
