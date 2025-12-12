import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import ListIop from './ListIop';
import PropTypes from 'prop-types';

const dbStore = initStore();

const ListWrapped = (props) => {
  const { permissions } = props.getUserPermissions
    ? props.getUserPermissions('advisor').then((res) => res)
    : { permissions: [] };
  const hasDisableRecPermission =
    permissions.includes('advisor:disable-recommendations:write') ||
    IOP_ENVIRONMENT_CONTEXT.isDisableRecEnabled;

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider
        value={{
          ...IOP_ENVIRONMENT_CONTEXT,
          isDisableRecEnabled: hasDisableRecPermission,
          CONTEXT_UPDATE_COMPONENT: 'ListWrapped', // just for testing
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
  getUserPermissions: PropTypes.func,
};

export default ListWrapped;
