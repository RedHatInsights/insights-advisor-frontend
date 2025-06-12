import React from 'react';
import PropTypes from 'prop-types';
import { EnvironmentContext } from '../App';
import { IOP_ENVIRONMENT_CONTEXT } from '../AppConstants';
import SystemDetail from '../Modules/SystemDetail';

const OnPremiseBridge = ({ children }) => (
  <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
    {children}
  </EnvironmentContext.Provider>
);

export const OnPremiseSysDetailsPage = () => (
  <OnPremiseBridge>
    <SystemDetail />
  </OnPremiseBridge>
);

OnPremiseBridge.propTypes = {
  children: PropTypes.node,
};
