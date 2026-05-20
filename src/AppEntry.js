import App from './App';
import PropTypes from 'prop-types';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { Provider } from 'react-redux';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initStore } from './Store';
import messages from '../locales/translations.json';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';

const queryClient = new QueryClient();

const AppEntry = ({ logger }) => {
  const store = useMemo(() => initStore([logger]), [logger]);

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <Provider store={store}>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </Provider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

AppEntry.propTypes = {
  logger: PropTypes.function,
};
export default AppEntry;
