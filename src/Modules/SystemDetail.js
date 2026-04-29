import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../Messages';
import SystemAdvisor from '../SmartComponents/SystemAdvisor/SystemAdvisor';
import { EnvironmentContext } from '../App';
import { useHccEnvironmentContext, useFeatureFlag } from '../Utilities/Hooks';
import { useKesselEnvironmentContext } from '../Utilities/useKesselEnvironmentContext';
import { Spinner } from '@patternfly/react-core';
import { useFlagsStatus } from '@unleash/proxy-client-react';

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
        <ReduxProvider store={store}>
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
    messages: PropTypes.array,
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

const SystemDetail = (props) => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return isKesselEnabled ? (
    <SystemDetailWithKessel {...props} />
  ) : (
    <SystemDetailWithRbacV1 {...props} />
  );
};

SystemDetail.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.array,
  }),
  store: PropTypes.object,
  IopRemediationModal: PropTypes.elementType,
};

export default SystemDetail;
