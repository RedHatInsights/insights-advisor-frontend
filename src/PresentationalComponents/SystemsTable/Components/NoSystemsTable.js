import React from 'react';
import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Text,
  TextContent,
  TextVariants,
  Bullseye, EmptyStateHeader,
} from '@patternfly/react-core';

const NoSystemsTable = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateHeader titleText="No matching systems found" headingLevel="h2" />
      <EmptyStateBody>
        <TextContent>
          <Text component={TextVariants.p}>
            To continue, edit your filter settings and search again.
          </Text>
        </TextContent>
      </EmptyStateBody>
    </EmptyState>
  </Bullseye>
);

export default NoSystemsTable;
