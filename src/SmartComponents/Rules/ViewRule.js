import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import { Section } from '@red-hat-insights/insights-frontend-components';

import '../../PresentationalComponents/Skeletons/_Skeleton.scss';
import '../../PresentationalComponents/RulesCard/_RulesCard.scss';

const ViewRule = () => {
    return (
        <Section type='content'>
            <Card className='ins-c-rules-card ins-c-card__skeleton pf-t-light  pf-m-opaque-100'>
                <CardHeader>
                    <div className='skeleton skeleton-md'>&nbsp;</div>
                </CardHeader>
                <CardBody>
                    <div className='skeleton skeleton-lg'>&nbsp;</div>
                </CardBody>
                <CardFooter>
                    <div className='skeleton skeleton-sm'>&nbsp;</div>
                </CardFooter>
            </Card>
            <Card className='ins-c-rules-card ins-c-card__skeleton pf-t-light  pf-m-opaque-100'>
                <CardHeader>
                    <div className='skeleton skeleton-md'>&nbsp;</div>
                </CardHeader>
                <CardBody>
                    <div className='skeleton skeleton-lg'>&nbsp;</div>
                </CardBody>
                <CardFooter>
                    <div className='skeleton skeleton-sm'>&nbsp;</div>
                </CardFooter>
            </Card>
            <Card className='ins-c-rules-card ins-c-card__skeleton pf-t-light  pf-m-opaque-100'>
                <CardHeader>
                    <div className='skeleton skeleton-md'>&nbsp;</div>
                </CardHeader>
                <CardBody>
                    <div className='skeleton skeleton-lg'>&nbsp;</div>
                </CardBody>
                <CardFooter>
                    <div className='skeleton skeleton-sm'>&nbsp;</div>
                </CardFooter>
            </Card>
            <Card className='ins-c-rules-card ins-c-card__skeleton pf-t-light  pf-m-opaque-100'>
                <CardHeader>
                    <div className='skeleton skeleton-md'>&nbsp;</div>
                </CardHeader>
                <CardBody>
                    <div className='skeleton skeleton-lg'>&nbsp;</div>
                </CardBody>
                <CardFooter>
                    <div className='skeleton skeleton-sm'>&nbsp;</div>
                </CardFooter>
            </Card>
        </Section>
    );
};

ViewRule.displayName = 'view-rule';

ViewRule.propTypes = {
    match: PropTypes.object
};

export default ViewRule;
