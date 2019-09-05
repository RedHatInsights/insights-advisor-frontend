/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Battery } from '@redhat-cloud-services/frontend-components';
import { Button, Split, SplitItem, StackItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../../AppActions';
import { SEVERITY_MAP } from '../../../AppConstants';
import messages from '../../../Messages';

const SummaryChartItem = ({ numIssues, name, riskName, affectedSystems, setFilters, history, intl }) => {
    const setChartFilters = () => {
        const totalRisk = `${SEVERITY_MAP[`${riskName}-risk`]}`;
        setFilters({ total_risk: totalRisk, reports_shown: true, impacting: true });
        history.push(`/rules`);
    };

    const returnLink = (children) => <Button variant="link" onClick={setChartFilters}>{children}</Button>;

    return <StackItem widget-type='InsightsSummaryChartItem' widget-id={name}>
        <Split style={{ alignItems: 'flex-end' }}>
            <SplitItem className='pf-u-pr-md'>
                {returnLink(<Battery label={riskName} severity={riskName} labelHidden={true} />)}
            </SplitItem>
            <SplitItem className='pf-u-text-align-right pf-u-pl-sm'>
                {returnLink(intl.formatMessage(messages.summaryChartItem, { numIssues, name, affectedSystems }))}

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
    setFilters: PropTypes.func,
    intl: PropTypes.any
};

const mapDispatchToProps = dispatch => ({
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default injectIntl(routerParams(connect(
    null,
    mapDispatchToProps
)(SummaryChartItem)));
