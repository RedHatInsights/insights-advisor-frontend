/* eslint-disable no-console */
import App from './App';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { Provider } from 'react-redux';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getStore } from './Store';
import messages from '../locales/data.json';

const AppEntry = () => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    messages={messages}
    onError={console.log}
  >
    <Provider store={getStore()}>
      <Router basename={getBaseName(window.location.pathname)}>
        <NotificationsPortal />
        <App />
      </Router>
    </Provider>
  </IntlProvider>
);

export default AppEntry;
