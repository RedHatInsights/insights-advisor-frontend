import React from 'react';
import PropTypes from 'prop-types';
import { BaseSystemAdvisor } from '../../SmartComponents/SystemAdvisor/SystemAdvisor';

const IopSystemAdvisor = ({ ...props }) => {
  const inventoryId = props.response?.insights_attributes?.uuid;
  const entity = {
    id: inventoryId,
    insights_id: inventoryId,
  };

  return (
    <BaseSystemAdvisor {...props} inventoryId={inventoryId} entity={entity} />
  );
};

IopSystemAdvisor.propTypes = {
  response: PropTypes.shape({
    insights_attributes: PropTypes.shape({
      uuid: PropTypes.string,
    }),
  }),
  IopRemediationModal: PropTypes.elementType,
};

export default IopSystemAdvisor;
