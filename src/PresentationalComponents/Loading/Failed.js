import { Card } from '@patternfly/react-core/dist/esm/components/Card/Card';
import { CardBody } from '@patternfly/react-core/dist/esm/components/Card/CardBody';
import { CardHeader } from '@patternfly/react-core/dist/esm/components/Card/CardHeader';
import FrownOpenIcon from '@patternfly/react-icons/dist/esm/icons/frown-open-icon';
import React from 'react';
import propTypes from 'prop-types';

const Failed = ({ message }) => (
  <Card className="adv-c-card-empty-rule" ouiaId="failed-card">
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
