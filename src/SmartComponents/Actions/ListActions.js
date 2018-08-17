import React from 'react';
import { withRouter } from 'react-router-dom';
import '../../App.scss';
import PropTypes from 'prop-types';

import { Card, CardHeader, CardBody } from '@patternfly/react-core';
import {
    Section
} from '@red-hat-insights/insights-frontend-components';

const ListActions = ({ match }) => {
    return (
        <Section type='content' className='actions__list'>
            <Card>
                <CardHeader className='actions__card'>{ match.params.id }</CardHeader>
                <CardBody>
                </CardBody>
            </Card>
        </Section>
    );
};

ListActions.propTypes = {
    match: PropTypes.any
};

export default withRouter(ListActions);
