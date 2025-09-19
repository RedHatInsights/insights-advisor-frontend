import { Card, CardBody } from '@patternfly/react-core';
import { List } from 'react-content-loader';
import React from 'react';
const Loading = () => (
  <Card ouiaId="loading-card">
    <CardBody>
      <List data-ouia-component-id="loading-skeleton" />
    </CardBody>
  </Card>
);

export default Loading;
