import React, { useContext } from 'react';
import { BaseSystemAdvisor } from './SystemAdvisor';
import PropTypes from 'prop-types';
import { EnvironmentContext } from '../../App';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { LockIcon } from '@patternfly/react-icons';
import messages from '../../Messages';

const SystemAdvisorWrapped = ({ ...props }) => {
  const envContext = useContext(EnvironmentContext);
  const inventoryId = props.response?.insights_attributes?.uuid;
  const entity = {
    id: inventoryId,
    insights_id: inventoryId,
  };

  return !envContext.isAllowedToViewRec ? (
    <MessageState
      variant="large"
      icon={LockIcon}
      title={messages.permsTitle.defaultMessage}
      text={messages.permsBody.defaultMessage}
    />
  ) : (
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
