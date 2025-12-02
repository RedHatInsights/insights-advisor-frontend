import './App.scss';

import React, { useEffect, useContext, createContext } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateTags, updateWorkloads } from './Services/Filters';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { AdvisorRoutes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { useHccEnvironmentContext } from './Utilities/Hooks';
import { LockIcon } from '@patternfly/react-icons';

export const EnvironmentContext = createContext({});

const App = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext?.globalFilterScope?.('insights');
    if (envContext?.globalFilterScope) {
      envContext.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
        const [workloads, selectedTags] =
          envContext?.mapGlobalFilter?.(data, false, true) || [];
        batch(() => {
          dispatch(updateWorkloads(workloads));
          dispatch(updateTags(selectedTags));
        });
      });
    }
  }, []);

  return (
    !envContext?.isLoading &&
    (envContext?.isAllowedToViewRec ? (
      <AdvisorRoutes />
    ) : (
      <MessageState
        variant="large"
        icon={LockIcon}
        title={intl.formatMessage(messages.permsTitle)}
        text={intl.formatMessage(messages.permsBody)}
      />
    ))
  );
};

const AppWithHccContext = () => {
  const envContext = useHccEnvironmentContext();

  return (
    <EnvironmentContext.Provider value={envContext}>
      <App />
    </EnvironmentContext.Provider>
  );
};

export default AppWithHccContext;
