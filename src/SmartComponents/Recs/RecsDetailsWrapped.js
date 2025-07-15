import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import OverviewDetails from './Details';

const RecsDetailsWrapped = (props) => (
  <IntlProvider locale="en" messages={messages}>
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <Provider store={initStore()}>
        <OverviewDetails {...props} />
      </Provider>
    </EnvironmentContext.Provider>
  </IntlProvider>
);

export default RecsDetailsWrapped;
