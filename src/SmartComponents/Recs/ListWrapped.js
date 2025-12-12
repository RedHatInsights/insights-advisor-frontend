import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import ListIop from './ListIop';
import { fetchIOPUserPermissions } from './helpers';
import propTypes from 'prop-types';

const dbStore = initStore();

const ListWrapped = (props) => {
  const [hasDisableRecPermission, setHasDisableRecPermission] = useState(false);

  useEffect(() => {
    fetchIOPUserPermissions(
      props.getUserPermissions,
      setHasDisableRecPermission,
    );
  }, []);

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider
        value={{
          ...IOP_ENVIRONMENT_CONTEXT,
          isDisableRecEnabled: hasDisableRecPermission,
        }}
      >
        <Provider store={dbStore}>
          <ListIop {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

ListWrapped.propTypes = {
  getUserPermissions: propTypes.func,
};

export default ListWrapped;
