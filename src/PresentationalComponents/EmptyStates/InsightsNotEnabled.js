import React from 'react';
import { ChartSpikeIcon } from '@patternfly/react-icons';
import {
  Bullseye,
  Button,
  ClipboardCopy,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';

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
