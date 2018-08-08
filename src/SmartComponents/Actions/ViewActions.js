import React from 'react';
import { withRouter } from 'react-router-dom';
import '../../App.scss';
import PropTypes from 'prop-types';

import { Card, CardHeader, CardBody } from '@patternfly/react-core';
import {
    Section
} from '@red-hat-insights/insights-frontend-components';

const root = document.getElementById('root');
root.classList.add(`actions__view`);

const ViewActions = ({ match }) => {
    return (
        <Section type='content'>
            <Card>
                <CardHeader className='risk__name'> { match.params.type } Risk Actions </CardHeader>
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
