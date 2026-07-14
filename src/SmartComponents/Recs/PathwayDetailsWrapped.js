import React from 'react';
import axios from 'axios';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import PathwayDetails from './DetailsPathways';
import { useIopEnvironmentContext } from '../../Utilities/Hooks';

const dbStore = initStore();

const iopAxios = axios.create({ baseURL: '/insights_cloud/' });

const PathwayDetailsWrapped = (props) => {
  const envContext = useIopEnvironmentContext();

  window.insights = window.insights || {};
  window.insights.chrome = window.insights.chrome || {
    auth: { getUser: () => Promise.resolve({}) },
    getUserPermissions: () => Promise.resolve([]),
    isBeta: () => false,
    getApp: () => 'advisor',
    getBundle: () => 'insights',
    on: () => () => {},
    isProd: false,
  };

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={envContext}>
        <Provider store={dbStore}>
          <PathwayDetails
            {...props}
            pathwayId={props.pathwayId}
            axios={iopAxios}
          />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

export default PathwayDetailsWrapped;
