import React from 'react';
import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Content,
  ContentVariants,
  Bullseye,
} from '@patternfly/react-core';

const NoSystemsTable = () => (
  <Bullseye>
    <EmptyState
      headingLevel="h2"
      titleText="No matching systems found"
      variant={EmptyStateVariant.full}
    >
      <EmptyStateBody>
        <Content>
          <Content component={ContentVariants.p}>
            To continue, edit your filter settings and search again.
          </Content>
        </Content>
      </EmptyStateBody>
    </EmptyState>
  </Bullseye>
);

export default NoSystemsTable;
