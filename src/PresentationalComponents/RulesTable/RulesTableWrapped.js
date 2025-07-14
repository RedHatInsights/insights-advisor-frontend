import React from 'react';
import { EnvironmentContext } from '../../App';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import RulesTable from './RulesTable';
import messages from '../../../locales/translations.json';
import { initStore } from '../../Store';

const RulesTableWrapped = (props) => (
  <IntlProvider locale="en" messages={messages}>
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <Provider store={initStore()}>
        <RulesTable {...props} />
      </Provider>
    </EnvironmentContext.Provider>
  </IntlProvider>
);

export default RulesTableWrapped;
