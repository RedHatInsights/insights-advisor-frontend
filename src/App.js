import './App.scss';

import React, { useEffect, useContext, createContext } from 'react';
import { batch, useDispatch } from 'react-redux';
import { updateTags, updateWorkloads } from './Services/Filters';
import MessageState from './PresentationalComponents/MessageState/MessageState';
import OutageAlert from './PresentationalComponents/OutageAlert/OutageAlert';
import { AdvisorRoutes } from './Routes';
import messages from './Messages';
import { useIntl } from 'react-intl';
import { useHccEnvironmentContext, useFeatureFlag } from './Utilities/Hooks';
import { useKesselEnvironmentContext } from './Utilities/useKesselEnvironmentContext';
import { LockIcon } from '@patternfly/react-icons';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { KESSEL_API_BASE_URL } from './AppConstants';
import { useFlagsStatus } from '@unleash/proxy-client-react';

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
      <React.Fragment>
        <OutageAlert />
        <AdvisorRoutes />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <OutageAlert />
        <MessageState
          variant="large"
          icon={LockIcon}
          title={intl.formatMessage(messages.permsTitle)}
          text={intl.formatMessage(messages.permsBody)}
        />
      </React.Fragment>
    ))
  );
};

/**
 * RBAC v1 branch of the permission split. Builds the environment context from
 * {@link useHccEnvironmentContext} (Chrome `getUserPermissions`) and provides it
 * to {@link App} via {@link EnvironmentContext}. Rendered when the
 * `advisor.kessel_enabled` feature flag is off.
 *
 *  @returns {React.ReactElement} `App` wrapped in an RBAC v1 environment context.
 */
const AppWithRbacV1Context = () => {
  const envContext = useHccEnvironmentContext();
  return (
    <EnvironmentContext.Provider value={envContext}>
      <App />
    </EnvironmentContext.Provider>
  );
};

/**
 * Kessel branch of the permission split. Builds the environment context from
 * {@link useKesselEnvironmentContext} (Kessel self-access check) and provides it
 * to {@link App} via {@link EnvironmentContext}. Rendered when the
 * `advisor.kessel_enabled` feature flag is on.
 *
 *  @returns {React.ReactElement} `App` wrapped in a Kessel environment context.
 */
const AppWithKesselContext = () => {
  const envContext = useKesselEnvironmentContext();
  return (
    <EnvironmentContext.Provider value={envContext}>
      <App />
    </EnvironmentContext.Provider>
  );
};

/**
 * Chooses the permission backend once Unleash flags are ready. Waits for
 * `flagsReady` (showing a spinner meanwhile) to avoid a race where RBAC v1 is
 * called during flag loading, then renders {@link AppWithKesselContext} when
 * `advisor.kessel_enabled` is on or {@link AppWithRbacV1Context} when it is off.
 *
 *  @returns {React.ReactElement} Loading spinner, or the flag-selected context wrapper.
 */
const AppWithContextProviders = () => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return isKesselEnabled ? <AppWithKesselContext /> : <AppWithRbacV1Context />;
};

/**
 * Standalone (HCC) application root and default export. Mounts the Kessel
 * `AccessCheck.Provider` (base URL `window.location.origin`, API path
 * {@link KESSEL_API_BASE_URL}) so the Kessel client is available regardless of
 * flag state, then delegates the RBAC v1 / Kessel choice to
 * {@link AppWithContextProviders}.
 *
 *  @returns {React.ReactElement} The fully wrapped Advisor application.
 */
const AppWithHccContext = () => {
  return (
    <AccessCheck.Provider
      baseUrl={window.location.origin}
      apiPath={KESSEL_API_BASE_URL}
    >
      <AppWithContextProviders />
    </AccessCheck.Provider>
  );
};

export default AppWithHccContext;
