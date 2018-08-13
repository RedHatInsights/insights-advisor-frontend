import React from 'react';
import { withRouter } from 'react-router-dom';
import '../../App.scss';
import PropTypes from 'prop-types';

import { Card, CardHeader, CardBody } from '@patternfly/react-core';
import {
    Section
} from '@red-hat-insights/insights-frontend-components';

const ViewActions = ({ match }) => {
    return (
        <Section type='content' className='actions__view'>
            <Card>
                <CardHeader className='actions__card'> { match.params.type } Risk Actions </CardHeader>
                <CardBody>
                </CardBody>
            </Card>
        </Section>
    );
};

ViewActions.propTypes = {
    match: PropTypes.any
};

export default withRouter(ViewActions);
