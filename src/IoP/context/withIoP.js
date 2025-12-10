import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { EnvironmentContext } from '../../App';
import messages from '../../../locales/translations.json';
import { initStore } from '../../Store';
import { IOP_ENVIRONMENT_CONTEXT } from '../constants';

export const withIoP = (Component) => {
  const Wrapped = (props) => (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
        <Provider store={initStore()}>
          <Component {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );

  Wrapped.displayName = `withIoP(${Component.displayName || Component.name})`;
  return Wrapped;
};
