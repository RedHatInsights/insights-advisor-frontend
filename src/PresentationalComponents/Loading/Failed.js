import { Card, CardBody, CardHeader } from '@patternfly/react-core';

import { FrownOpenIcon } from '@patternfly/react-icons';
import React from 'react';
import propTypes from 'prop-types';

const Failed = ({ message }) => (
  <Card className="adv-c-card-empty-rule">
    <CardHeader>
      <FrownOpenIcon size="lg" />
    </CardHeader>
    <CardBody>{message}</CardBody>
  </Card>
);

export default Failed;

Failed.propTypes = {
  message: propTypes.string,
};
