import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../Messages';
import SystemAdvisor from '../SmartComponents/SystemAdvisor/SystemAdvisor';
import { EnvironmentContext } from '../App';
import { useHccEnvironmentContext } from '../Utilities/Hooks';

const SystemDetail = ({
  customItnl,
  intlProps,
  store,
  IopRemediationModal,
  ...props
}) => {
  const Wrapper = customItnl ? IntlProvider : Fragment;
  const ReduxProvider = store ? Provider : Fragment;
  const envContext = useHccEnvironmentContext();
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
