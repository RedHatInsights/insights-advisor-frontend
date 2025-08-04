import React, { useContext } from 'react';
import ChartSpikeIcon from '@patternfly/react-icons/dist/esm/icons/chart-spike-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import {
  Bullseye,
  Button,
  ClipboardCopy,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { EnvironmentContext } from '../../App';
import PropTypes from 'prop-types';

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

export const InsightsNotEnabled = () => {
  const envContext = useContext(EnvironmentContext);
  const brand = envContext.isLightspeedEnabled ? ' Lightspeed ' : ' Insights ';

  return (
    <MessageState
      iconClass="chartSpikeIconColor"
      icon={ChartSpikeIcon}
      title={`Get started with Red Hat ${brand}`}
      text={
        <Bullseye>
          <Stack hasGutter>
            <StackItem>
              1. Install the client on the RHEL system.
              <ClipboardCopy>yum install insights-client</ClipboardCopy>
            </StackItem>
            <StackItem>
              2. Register the system to Red Hat {brand}.
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
};

export const InventoryReportFetchFailed = ({ entity }) => {
  const envContext = useContext(EnvironmentContext);
  const brand = envContext.isLightspeedEnabled ? ' Lightspeed ' : ' Insights ';

  return (
    <Bullseye>
      <MessageState
        icon={TimesCircleIcon}
        title="Error getting recommendations"
        text={
          entity
            ? `There was an error fetching recommendations for this entity. Refresh your page to try again.`
            : `This entity can not be found or might no longer be registered to Red Hat ${brand}.`
        }
      />
    </Bullseye>
  );
};

InventoryReportFetchFailed.propTypes = {
  entity: PropTypes.object,
};
