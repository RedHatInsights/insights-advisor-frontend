import App from './App';
import PropTypes from 'prop-types';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { Provider } from 'react-redux';
import React, { useMemo } from 'react';
import { initStore } from './Store';
import messages from '../locales/translations.json';

const AppEntry = ({ logger }) => {
  const store = useMemo(() => initStore([logger]), [logger]);

  return (
    <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
      <Provider store={store}>
        <NotificationsPortal />
        <App />
      </Provider>
    </IntlProvider>
  );
};

AppEntry.propTypes = {
  logger: PropTypes.function,
};
export default AppEntry;
