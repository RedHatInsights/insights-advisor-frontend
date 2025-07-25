import React from 'react';
import { EnvironmentContext } from '../App';
import { IOP_ENVIRONMENT_CONTEXT } from '../AppConstants';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import messages from '../../locales/translations.json';
import { initStore } from '../Store';
import SystemAdvisorWrapped from '../SmartComponents/SystemAdvisor/SystemAdvisorWrapped';
import PropTypes from 'prop-types';

const SystemDetailWrapped = (props) => (
  <IntlProvider locale="en" messages={messages}>
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <Provider store={initStore()}>
        <SystemAdvisorWrapped
          {...props}
          IopRemediationModal={props.IopRemediationModal}
        />
      </Provider>
    </EnvironmentContext.Provider>
  </IntlProvider>
);

SystemDetailWrapped.propTypes = {
  IopRemediationModal: PropTypes.elementType,
};

export default SystemDetailWrapped;
