/* eslint camelcase: 0 */
import * as AppActions from '../../../AppActions';

import { Split, SplitItem } from '@patternfly/react-core/dist/js/layouts/Split/index';

import { Battery } from '@redhat-cloud-services/frontend-components/components/Battery';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import PropTypes from 'prop-types';
import React from 'react';
import { SEVERITY_MAP } from '../../../AppConstants';
import { StackItem } from '@patternfly/react-core/dist/js/layouts/Stack/StackItem';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const SummaryChartItem = ({ numIssues, name, riskName, affectedSystems, setFilters, history, intl }) => {
    const setChartFilters = () => {
        const totalRisk = `${SEVERITY_MAP[`${riskName}-risk`]}`;
        setFilters({ total_risk: [totalRisk], reports_shown: 'true', impacting: true });
        history.push(`/recommendations`);
    };

    const returnLink = (children) => <Button className='paddingLeftLabelOverride' variant="link" onClick={setChartFilters}>{children}</Button>;

    return <StackItem widget-type='InsightsSummaryChartItem' widget-id={name}>
        <Split className='flexAlignOverride'>
            <SplitItem>
                {returnLink(<Battery label={riskName} severity={riskName} labelHidden={true} />)}
            </SplitItem>
            <SplitItem>
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
