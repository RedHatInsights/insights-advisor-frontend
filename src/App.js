import './App.scss';

import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateSID, updateTags, updateWorkloads } from './Services/Filters';
import { useHistory } from 'react-router-dom';

import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { PERMS } from './AppConstants';
import { Routes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const App = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const permsViewRecs = usePermissions('advisor', PERMS.viewRecs);
  const dispatch = useDispatch();

  useEffect(() => {
    insights.chrome.init();
    insights.chrome.identifyApp('advisor');
    insights.chrome?.globalFilterScope?.('insights');
    if (insights.chrome?.globalFilterScope) {
      insights.chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
        const [workloads, SID, selectedTags] =
          insights.chrome?.mapGlobalFilter?.(data, false, true) || [];
        batch(() => {
          dispatch(updateWorkloads(workloads));
          dispatch(updateTags(selectedTags));
          dispatch(updateSID(SID));
        });
      });
    }

    const unregister = insights.chrome.on('APP_NAVIGATION', (event) => {
      if (event.domEvent) {
        push(`/${event.navId}`);
      }
    });

    return () => unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    !permsViewRecs?.isLoading &&
    (permsViewRecs?.hasAccess ? (
      <Routes />
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
