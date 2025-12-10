import React from 'react';
import PropTypes from 'prop-types';
import IopSystemAdvisor from '../components/IopSystemAdvisor';

const SystemDetail = (props) => (
  <IopSystemAdvisor {...props} IopRemediationModal={props.IopRemediationModal} />
);

SystemDetail.propTypes = {
  IopRemediationModal: PropTypes.elementType,
};

export default SystemDetail;
