import React from 'react';
import { EnvironmentContext } from '../../App';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import RulesTable from './RulesTable';
import messages from '../../../locales/translations.json';
import { initStore } from '../../Store';
import { useIopEnvironmentContext } from '../../Utilities/Hooks';

const RulesTableWrapped = (props) => {
  const envContext = useIopEnvironmentContext();

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={envContext}>
        <Provider store={initStore()}>
          <RulesTable {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

export default RulesTableWrapped;
