import React from 'react';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { Bullseye } from '@patternfly/react-core';
import MessageState from '../MessageState/MessageState';
import PropTypes from 'prop-types';

export const InventoryReportFetchFailed = ({ entity }) => (
  <Bullseye>
    <MessageState
      icon={TimesCircleIcon}
      title="Error getting recommendations"
      text={
        entity
          ? `There was an error fetching recommendations for this entity. Refresh your page to try again.`
          : `This entity can not be found or might no longer be registered to Red Hat Insights.`
      }
    />
  </Bullseye>
);

InventoryReportFetchFailed.propTypes = {
  entity: PropTypes.object,
};
