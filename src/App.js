import './App.scss';

import React, { useEffect, useContext, createContext } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateSID, updateTags, updateWorkloads } from './Services/Filters';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
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
  const chrome = useChrome();
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    chrome.identifyApp('advisor');
    chrome?.globalFilterScope?.('insights');
    if (chrome?.globalFilterScope) {
      chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
        const [workloads, SID, selectedTags] =
          chrome?.mapGlobalFilter?.(data, false, true) || [];
        batch(() => {
          dispatch(updateWorkloads(workloads));
          dispatch(updateTags(selectedTags));
          dispatch(updateSID(SID));
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
