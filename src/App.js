import './App.scss';

import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateSID, updateTags, updateWorkloads } from './Services/Filters';
import { useNavigate } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { PERMS } from './AppConstants';
import { AdvisorRoutes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const App = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const permsViewRecs = usePermissions('advisor', PERMS.viewRecs);
  const dispatch = useDispatch();
  const chrome = useChrome();

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

    const unregister = chrome.on('APP_NAVIGATION', (event) => {
      if (event.domEvent) {
        navigate(`/${event.navId}`);
      }
    });

    return () => unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    !permsViewRecs?.isLoading &&
    (permsViewRecs?.hasAccess ? (
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

export default App;
