import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Battery } from '@redhat-cloud-services/frontend-components';
import { Split, SplitItem, StackItem } from '@patternfly/react-core';

const SummaryChartItem = (props) => {
    const { numIssues, name, riskName } = props;
    const returnLink = (children) => <Link to={ `/overview/${riskName}` }> { children } </Link>;

    return (
        <StackItem widget-type='InsightsSummaryChartItem' widget-id={ name }>
            <Split style={ { alignItems: 'flex-end' } }>
                <SplitItem className='pf-u-pr-md'>
                    { returnLink(<Battery label={ riskName } severity={ name.toLowerCase() } labelHidden={ true }/>) }
                </SplitItem>
                <SplitItem className='pf-u-text-align-right pf-u-pl-sm' >
                    { returnLink(`${numIssues} ${name} affecting ${props.affectedSystems} systems`) }
                </SplitItem>
            </Split>
        </StackItem>
    );
};

SummaryChartItem.propTypes = {
    affectedSystems: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    numIssues: PropTypes.number.isRequired,
    riskName: PropTypes.string.isRequired
};

export default SummaryChartItem;
