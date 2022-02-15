import React from 'react';
import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Text,
  TextContent,
  TextVariants,
  Title,
  Bullseye,
} from '@patternfly/react-core';

const NoSystemsTable = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.full}>
      <Title headingLevel="h2" size="lg" style={{ fontWeight: 'bold' }}>
        No matching systems found
      </Title>
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
