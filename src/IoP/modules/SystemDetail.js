/**
 * @fileoverview High-level module export for system detail view in IoP environment.
 * This module is exposed via module federation for consumption by Foreman/Satellite.
 */

import React from 'react';
import PropTypes from 'prop-types';
import IopSystemAdvisor from '../components/IopSystemAdvisor';

/**
 * System detail module for IoP environment.
 * This is a top-level module exported via module federation that wraps
 * IopSystemAdvisor. It serves as the entry point for the system detail
 * page when consumed by Foreman/Satellite.
 *
 * @module SystemDetail
 * @param {Object} props - Component props
 * @param {React.ElementType} [props.IopRemediationModal] - Custom remediation modal component
 * @param {Object} [props.response] - IoP API response with system data
 * @param {Object} props...rest - Additional props passed to IopSystemAdvisor
 * @returns {React.ReactElement} IopSystemAdvisor component
 *
 * @example
 * // In module federation consumer (Foreman/Satellite)
 * const SystemDetail = React.lazy(() => import('advisor/SystemDetailWrapped'));
 *
 * <SystemDetail
 *   response={systemData}
 *   IopRemediationModal={CustomModal}
 * />
 */
const SystemDetail = (props) => (
  <IopSystemAdvisor
    {...props}
    IopRemediationModal={props.IopRemediationModal}
  />
);

SystemDetail.propTypes = {
  IopRemediationModal: PropTypes.elementType,
};

export default SystemDetail;
