import React from 'react';
import {
  ExternalLinkAltIcon,
  PficonSatelliteIcon,
} from '@patternfly/react-icons';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';

export const HideResultsSatelliteManaged = () => (
  <MessageState
    icon={PficonSatelliteIcon}
    title="Satellite managed system"
    text={
      <span key="satellite managed system">
        Insights results can not be displayed for this host, as the &quot;Hide
        Satellite Managed Systems&quot; setting has been enabled by an org
        admin.
        <br />
        For more information on this setting and how to modify it,
        <a href="https://access.redhat.com/solutions/4281761" rel="noopener">
          {' '}
          Please visit this Knowledgebase article &nbsp;
          <ExternalLinkAltIcon />
        </a>
        .
      </span>
    }
  />
);
