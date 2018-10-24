import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import classNames from 'classnames';

import { Ansible, Battery, Section } from '@red-hat-insights/insights-frontend-components';
import { Card, CardHeader, CardBody, CardFooter, Split, SplitItem } from '@patternfly/react-core';

import './_RulesCard.scss';

/**
 * This is the card that displays information for the rules as well as links to the proper
 * url of systems impacted under that rule (if there are systems)
 */

const RulesCard =
({
    category,
    description,
    summary,
    ansible,
    impact,
    likelihood,
    totalRisk,
    riskOfChange,
    hitCount,
    ruleID,
    className,
    ...props
}) => {

    let rulesCardClasses = classNames(
        'ins-c-rules-card',
        'pf-t-light',
        'pf-m-opaque-100',
        className
    );

    return (
        <Card { ...props } className = { rulesCardClasses } widget-type='InsightsRulesCard'>
            <CardHeader>
                <Split>
                    <SplitItem> { category } &gt; </SplitItem>
                    <SplitItem isMain> { description } </SplitItem>
                    <SplitItem>
                        <Ansible unsupported = { ansible }/>
                    </SplitItem>
                </Split>
            </CardHeader>
            <CardBody>
                <div dangerouslySetInnerHTML={ { __html: summary } }/>
            </CardBody>
            <CardFooter>
                <div className='space-between'>
                    <Section type='icon-group__with-major'>
                        <Battery label='Impact' severity={ impact.impact }/>
                        <Battery label='Likelihood' severity={ likelihood }/>
                        <Battery label='Total Risk' severity={ totalRisk }/>
                        <Battery label='Risk Of Change' severity={ riskOfChange }/>
                    </Section>
                    { hitCount > 0 && (
                        <Link to={ `/actions/${category.toLowerCase()}/${ruleID}` }
                            aria-label={ `${hitCount} impacted system${hitCount > 1 ? 's' : ''}` }> View Impacted Systems ({ hitCount }) </Link>
                    ) }
                    { hitCount <= 0 && (
                        <a disabled aria-label='No impacted systems'> View Impacted Systems (0) </a>
                    ) }
                </div>
            </CardFooter>
        </Card>
    );
};

export default RulesCard;

RulesCard.propTypes = {
    ruleID: propTypes.string,
    category: propTypes.string,
    description: propTypes.string,
    summary: propTypes.string,
    ansible: propTypes.number,
    impact: propTypes.number,
    likelihood: propTypes.number,
    totalRisk: propTypes.number,
    riskOfChange: propTypes.number,
    hitCount: propTypes.number,
    className: propTypes.string
};
