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
        <Section type='content'>
            <Card>
                <CardHeader> { match.params.type } </CardHeader>
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
