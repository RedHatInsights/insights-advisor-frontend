import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';

import axios from 'axios';
import IopRecommendationDetails from './IopRecommendationDetails';
import { fetchIOPUserPermissions } from './helpers';
import PropTypes from 'prop-types';

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

const dbStore = initStore();

const RecommendationDetailsWrapped = (props) => {
  const [hasDisableRecPermission, setHasDisableRecPermission] = useState(false);

  useEffect(() => {
    fetchIOPUserPermissions(
      props.getUserPermissions,
      setHasDisableRecPermission,
    );
  }, []);

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider
        value={{
          ...IOP_ENVIRONMENT_CONTEXT,
          isDisableRecEnabled: hasDisableRecPermission,
        }}
      >
        <Provider store={dbStore}>
          <IopRecommendationDetails {...props} axios={instance} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

RecommendationDetailsWrapped.propTypes = {
  getUserPermissions: PropTypes.func,
};

export default RecommendationDetailsWrapped;
