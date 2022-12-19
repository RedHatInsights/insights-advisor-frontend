/* eslint-disable no-console */
import App from './App';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { Provider } from 'react-redux';
import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getStore } from './Store';
import messages from '../locales/translations.json';

const AppEntry = () => {
  const store = useMemo(() => getStore(), []);

  return (
    <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
      <Provider store={store}>
        <Router basename={getBaseName(window.location.pathname)}>
          <NotificationsPortal />
          <App />
        </Router>
      </Provider>
    </IntlProvider>
  );
};

export default AppEntry;
