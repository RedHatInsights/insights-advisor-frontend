import React from 'react';
import {
  ChartSpikeIcon,
  CheckIcon,
  ExternalLinkAltIcon,
  PficonSatelliteIcon,
  TimesCircleIcon,
} from '@patternfly/react-icons';
import {
  Bullseye,
  Button,
  ClipboardCopy,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import PropTypes from 'prop-types';

// These should be in separate files and in a components directory or presentational
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

export const NoMatchingRecommendations = () => (
  <Bullseye>
    <MessageState
      title="No matching recommendations found"
      text={`To continue, edit your filter settings and search again.`}
    />
  </Bullseye>
);

export const NoRecommendations = () => (
  <Bullseye>
    <MessageState
      icon={CheckIcon}
      iconClass="ins-c-insights__check"
      title="No recommendations"
      text={`No known recommendations affect this system`}
    />
  </Bullseye>
);

export const InsightsNotEnabled = () => (
  <MessageState
    iconClass="chartSpikeIconColor"
    icon={ChartSpikeIcon}
    title="Get started with Red Hat Insights"
    text={
      <Bullseye>
        <Stack hasGutter>
          <StackItem>
            1. Install the client on the RHEL system.
            <ClipboardCopy>yum install insights-client</ClipboardCopy>
          </StackItem>
          <StackItem>
            2. Register the system to Red Hat Insights.
            <ClipboardCopy>insights-client --register</ClipboardCopy>
          </StackItem>
        </Stack>
      </Bullseye>
    }
  >
    <Button
      component="a"
      href="https://access.redhat.com/products/red-hat-insights#getstarted"
      target="_blank"
      variant="primary"
    >
      Getting started documentation
    </Button>
  </MessageState>
);

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
