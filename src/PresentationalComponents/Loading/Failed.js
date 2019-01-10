import React from 'react';
import { Card, CardBody, CardHeader } from '@patternfly/react-core';
import { FrownOpenIcon } from '@patternfly/react-icons';
import propTypes from 'prop-types';

const Failed = ({ message }) => <>
    <Card className="ins-empty-rule-cards">
        <CardHeader>
            <FrownOpenIcon size='lg'/>
        </CardHeader>
        <CardBody>
            { message }
        </CardBody>
    </Card></>;

export default Failed;

Failed.propTypes = {
    message: propTypes.string
};

