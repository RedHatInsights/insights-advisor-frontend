import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import classNames from 'classnames';

import { Ansible, Battery, Section } from '@red-hat-insights/insights-frontend-components';
import { Card, CardHeader, CardBody, CardFooter, Split, SplitItem } from '@patternfly/react-core';

import './_RulesCard.scss';

/**
 * This is a dumb component that only recieves properties from a smart component.
 * Dumb components are usually functions and not classes.
 *
 * @param props the props given by the smart component.
 */

const RulesCard =
({
    category,
    id,
    summary,
    ansible,
    impact,
    likelihood,
    totalRisk,
    riskOfChange,
    hitCount,
    className,
    ...props
}) => {

    let rulesCardClasses = classNames(
        'ins-c-rules-card',
        className
    );

    let renderHitCount;
    if (hitCount > 0) {
        renderHitCount =
        <Link to={ `/actions/${category.toLowerCase()}/${id}` } aria-label='No impacted systems'> View Impacted Systems ({ hitCount }) </Link>;
    }
    else {
        renderHitCount = <a disabled aria-label='No impacted systems'> View Impacted Systems (0) </a>;
    }

    return (
        <Card { ...props } className = { rulesCardClasses }>
            <CardHeader>
                <Split>
                    <SplitItem> { category } &gt; </SplitItem>
                    <SplitItem> { id } </SplitItem>
                    <SplitItem>
                        <Ansible unsupported = { ansible }/>
                    </SplitItem>
                </Split>
            </CardHeader>
            <CardBody>
                <div dangerouslySetInnerHTML={{ __html: summary }}/>
            </CardBody>
            <CardFooter>
                <div className='space-between'>
                    <Section type='icon-group__with-major'>
                        <Battery label='Impact' severity={ impact }/>
                        <Battery label='Likelihood' severity={ likelihood }/>
                        <Battery label='Total Risk' severity={ totalRisk }/>
                        <Battery label='Risk Of Change' severity={ riskOfChange }/>
                    </Section>
                    { ...renderHitCount }
                </div>
            </CardFooter>
        </Card>
    );
};

export default RulesCard;

RulesCard.propTypes = {
    category: propTypes.string,
    id: propTypes.string,
    summary: propTypes.string,
    ansible: propTypes.number,
    impact: propTypes.number,
    likelihood: propTypes.number,
    totalRisk: propTypes.number,
    riskOfChange: propTypes.number,
    hitCount: propTypes.number,
    className: propTypes.string
};
