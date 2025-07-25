import React from 'react';
import { BaseSystemAdvisor } from './SystemAdvisor';
import PropTypes from 'prop-types';

const SystemAdvisorWrapped = ({ ...props }) => {
  const inventoryId = props.response?.insights_attributes?.uuid;
  const entity = {
    id: inventoryId,
    insights_id: inventoryId,
  };

  return (
    <BaseSystemAdvisor {...props} inventoryId={inventoryId} entity={entity} />
  );
};

SystemAdvisorWrapped.propTypes = {
  response: PropTypes.shape({
    insights_attributes: PropTypes.shape({
      uuid: PropTypes.string,
    }),
  }),
};

export default SystemAdvisorWrapped;
