import React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SatelliteIcon } from '@patternfly/react-icons';

export const SatelliteDemoComponent = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        titleText="This is a demo component"
        icon={<EmptyStateIcon icon={SatelliteIcon} size="sm" />}
        headingLevel="h5"
      />
      <EmptyStateBody>
        Demo component for Vulnerability for IoP integration.
      </EmptyStateBody>
    </EmptyState>
  </Bullseye>
);

export default SatelliteDemoComponent;
