import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../../locales/translations.json';
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { initStore } from '../../Store';
import ListIop from './ListIop';
import { useRbac } from '../../Utilities/Hooks';
import { PERMISSIONS } from '../../AppConstants';

const dbStore = initStore();

const ListWrapped = (props) => {
  const [[hasDisableRecPermission, hasViewRecPermission]] = useRbac([
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  const disableRecPermission =
    Array.isArray(hasDisableRecPermission) &&
    hasDisableRecPermission.length === 0
      ? false
      : hasDisableRecPermission;
  const viewRecPermission =
    Array.isArray(hasViewRecPermission) && hasViewRecPermission.length === 0
      ? false
      : hasViewRecPermission;

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider
        value={{
          ...IOP_ENVIRONMENT_CONTEXT,
          isDisableRecEnabled: disableRecPermission,
          isAllowedToViewRec: viewRecPermission,
        }}
      >
        <Provider store={dbStore}>
          <ListIop {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};

export default ListWrapped;
