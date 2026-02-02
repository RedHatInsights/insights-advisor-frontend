import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import ListIop from './ListIop';
import { useIopEnvironmentContext } from '../../Utilities/Hooks';

const dbStore = initStore();

const ListWrapped = (props) => {
  const envContext = useIopEnvironmentContext();

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={envContext}>
        <Provider store={dbStore}>
          <ListIop {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

export default ListWrapped;
