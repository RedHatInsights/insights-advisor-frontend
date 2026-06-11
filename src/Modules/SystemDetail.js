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

const SystemDetailWithRbacV1 = (props) => {
  const envContext = useHccEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

const SystemDetailWithKessel = (props) => {
  const envContext = useKesselEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

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
