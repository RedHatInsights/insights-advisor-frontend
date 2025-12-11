import React from 'react';
import PropTypes from 'prop-types';
import { BaseSystemAdvisor } from '../../SmartComponents/SystemAdvisor/SystemAdvisor';

/**
 * System advisor wrapper component for IoP environment.
 * Extracts the inventory UUID from the IoP response format and transforms
 * it into the entity structure expected by the base SystemAdvisor component.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.response - IoP API response object
 * @param {Object} props.response.insights_attributes - Insights attributes from IoP
 * @param {string} props.response.insights_attributes.uuid - System UUID from IoP
 * @param {React.ElementType} [props.IopRemediationModal] - Custom remediation modal component for IoP
 * @param {Object} props...rest - Additional props passed through to BaseSystemAdvisor
 * @returns {React.ReactElement} BaseSystemAdvisor component with mapped IoP data
 *
 * @example
 * <IopSystemAdvisor
 *   response={{
 *     insights_attributes: {
 *       uuid: 'abc-123-def-456'
 *     }
 *   }}
 *   IopRemediationModal={CustomIopModal}
 * />
 */
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
