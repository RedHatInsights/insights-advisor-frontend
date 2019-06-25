/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Battery } from '@redhat-cloud-services/frontend-components';
import { Button, Split, SplitItem, StackItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';

import * as AppActions from '../../../AppActions';
import { SEVERITY_MAP } from '../../../AppConstants';

const SummaryChartItem = (props) => {
    const { numIssues, name, riskName } = props;
    const setFilters = () => {
        const totalRisk = `${SEVERITY_MAP[riskName]}`;
        props.setFilters({ total_risk: totalRisk, reports_shown: true, impacting: true });
        props.history.push(`/overview/${riskName}`);
    };

    const returnLink = (children) => <Button variant="link" onClick={ setFilters }>{ children }</Button>;

    return <StackItem widget-type='InsightsSummaryChartItem' widget-id={ name }>
        <Split style={ { alignItems: 'flex-end' } }>
            <SplitItem className='pf-u-pr-md'>
                { returnLink(<Battery label={ riskName } severity={ name.toLowerCase() } labelHidden={ true }/>) }
            </SplitItem>
            <SplitItem className='pf-u-text-align-right pf-u-pl-sm'>
                { returnLink(`${numIssues} ${name} affecting ${props.affectedSystems.toLocaleString()} systems`) }
            </SplitItem>
        </Split>
    </StackItem>;
};

SummaryChartItem.propTypes = {
    affectedSystems: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    numIssues: PropTypes.number.isRequired,
    riskName: PropTypes.string.isRequired,
    history: PropTypes.object,
    setFilters: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default routerParams(connect(
    null,
    mapDispatchToProps
)(SummaryChartItem));
