import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../Messages';
import SystemAdvisor from '../SmartComponents/SystemAdvisor/SystemAdvisor';
import { EnvironmentContext } from '../App';
import { useHccEnvironmentContext, useFeatureFlag } from '../Utilities/Hooks';
import { useKesselEnvironmentContext } from '../Utilities/useKesselEnvironmentContext';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useFlagsStatus } from '@unleash/proxy-client-react';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { KESSEL_API_BASE_URL } from '../AppConstants';

const SystemDetailContent = ({
  customItnl,
  intlProps,
  store,
  IopRemediationModal,
  envContext,
  ...props
}) => {
  const Wrapper = customItnl ? IntlProvider : Fragment;
  const ReduxProvider = store ? Provider : Fragment;

  return (
    <EnvironmentContext.Provider value={envContext}>
      <Wrapper
        {...(customItnl && {
          locale: navigator.language.slice(0, 2),
          messages,
          ...intlProps,
        })}
      >
        <ReduxProvider {...(store && { store })}>
          <SystemAdvisor {...props} IopRemediationModal={IopRemediationModal} />
        </ReduxProvider>
      </Wrapper>
    </EnvironmentContext.Provider>
  );
};

SystemDetailContent.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.string),
  }),
  store: PropTypes.object,
  IopRemediationModal: PropTypes.elementType,
  envContext: PropTypes.object.isRequired,
};

/**
 * RBAC v1 branch of the SystemDetail permission split. Builds the environment
 * context from {@link useHccEnvironmentContext} (Chrome `getUserPermissions`)
 * and passes it to `SystemDetailContent`. Rendered when the
 * `advisor.kessel_enabled` feature flag is off.
 *
 *  @param {object} props - Props forwarded to `SystemDetailContent`.
 *  @returns {React.ReactElement} SystemDetail content with an RBAC v1 context.
 */
const SystemDetailWithRbacV1 = (props) => {
  const envContext = useHccEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

/**
 * Kessel branch of the SystemDetail permission split. Builds the environment
 * context from {@link useKesselEnvironmentContext} (Kessel self-access check)
 * and passes it to `SystemDetailContent`. Rendered when the
 * `advisor.kessel_enabled` feature flag is on.
 *
 *  @param {object} props - Props forwarded to `SystemDetailContent`.
 *  @returns {React.ReactElement} SystemDetail content with a Kessel context.
 */
const SystemDetailWithKessel = (props) => {
  const envContext = useKesselEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

/**
 * Chooses the permission backend for SystemDetail once Unleash flags are ready.
 * Waits for `flagsReady` (showing a spinner meanwhile) to avoid a race where
 * RBAC v1 is called during flag loading, then renders
 * {@link SystemDetailWithKessel} when `advisor.kessel_enabled` is on or
 * {@link SystemDetailWithRbacV1} when it is off.
 *
 *  @param {object} props - Props forwarded to the selected branch.
 *  @returns {React.ReactElement} Loading spinner, or the flag-selected context wrapper.
 */
const SystemDetailWithContextProviders = (props) => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  return isKesselEnabled ? (
    <SystemDetailWithKessel {...props} />
  ) : (
    <SystemDetailWithRbacV1 {...props} />
  );
};

/**
 * Federated SystemDetail module entry point consumed by Chrome's System Detail
 * page. Mounts the Kessel `AccessCheck.Provider` (base URL
 * `window.location.origin`, API path {@link KESSEL_API_BASE_URL}) so the Kessel
 * client is available regardless of flag state, then delegates the RBAC v1 /
 * Kessel choice to {@link SystemDetailWithContextProviders}.
 *
 *  @param {object} props - Host-supplied props (e.g. `store`, `customItnl`,
 *    `intlProps`, `IopRemediationModal`).
 *  @returns {React.ReactElement} The fully wrapped SystemDetail module.
 */
const SystemDetail = (props) => {
  return (
    <AccessCheck.Provider
      baseUrl={window.location.origin}
      apiPath={KESSEL_API_BASE_URL}
    >
      <SystemDetailWithContextProviders {...props} />
    </AccessCheck.Provider>
  );
};

SystemDetail.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.string),
  }),
  store: PropTypes.object,
  IopRemediationModal: PropTypes.elementType,
};

export default SystemDetail;
