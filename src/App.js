import './App.scss';

import React, { useEffect, useContext, createContext } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateTags, updateWorkloads } from './Services/Filters';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import { AdvisorRoutes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { useHccEnvironmentContext, useFeatureFlag } from './Utilities/Hooks';
import { useKesselEnvironmentContext } from './Utilities/useKesselEnvironmentContext';
import { LockIcon } from '@patternfly/react-icons';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { KESSEL_API_BASE_URL } from './AppConstants';

export const EnvironmentContext = createContext({});

const App = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext?.globalFilterScope?.('insights');

    envContext.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
      const [workloads, , encodedTags] = envContext?.mapGlobalFilter?.(
        data,
        true,
        true,
      ) || [null, null, []];
      const selectedTags =
        encodedTags?.map((tag) => {
          const fullyDecoded = decodeURIComponent(decodeURIComponent(tag));
          const slashIndex = fullyDecoded.indexOf('/');
          const equalsIndex = fullyDecoded.indexOf('=', slashIndex);
          if (equalsIndex === -1) return fullyDecoded;

          const namespaceAndKey = fullyDecoded.substring(0, equalsIndex);
          const value = fullyDecoded.substring(equalsIndex + 1);
          const encodedValue = value.replace(/=/g, '%3D').replace(/\//g, '%2F');
          return `${namespaceAndKey}=${encodedValue}`;
        }) || [];
      batch(() => {
        dispatch(updateWorkloads(workloads));
        dispatch(updateTags(selectedTags));
      });
    });
  }, [envContext, dispatch]);

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

const AppWithRbacV1 = () => {
  const hccContext = useHccEnvironmentContext();

  return (
    <EnvironmentContext.Provider value={hccContext}>
      <App />
    </EnvironmentContext.Provider>
  );
};

const AppWithKessel = () => {
  const kesselContext = useKesselEnvironmentContext();

  return (
    <EnvironmentContext.Provider value={kesselContext}>
      <App />
    </EnvironmentContext.Provider>
  );
};

const AppWithHccContext = () => {
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  return isKesselEnabled ? (
    <AccessCheck.Provider
      baseUrl={window.location.origin}
      apiPath={KESSEL_API_BASE_URL}
    >
      <AppWithKessel />
    </AccessCheck.Provider>
  ) : (
    <AppWithRbacV1 />
  );
};

export default AppWithHccContext;
