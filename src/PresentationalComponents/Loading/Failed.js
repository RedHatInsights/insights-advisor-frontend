import { Card } from '@patternfly/react-core/dist/js/components/Card/Card';
import { CardBody } from '@patternfly/react-core/dist/js/components/Card/CardBody';
import { CardHeader } from '@patternfly/react-core/dist/js/components/Card/CardHeader';
import  FrownOpenIcon  from '@patternfly/react-icons/dist/js/icons/frown-open-icon';
import React from 'react';
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

