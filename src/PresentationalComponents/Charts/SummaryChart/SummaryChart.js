import './SummaryChart.scss';

import { SEVERITY_MAP, TOTAL_RISK_LABEL } from '../../../AppConstants';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack/index';

import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from '../../../Utilities/asyncComponent';
import { injectIntl } from 'react-intl';
import { invert } from 'lodash';
import messages from '../../../Messages';

const SummaryChartItem = asyncComponent(() => import('./SummaryChartItem'));

const SummaryChart = ({ reportsTotalRisk, rulesTotalRisk, intl }) => {
    const noHits = [];
    const hitsBuilder = (rulesTotalRisk, totalIssues) => Object.entries(rulesTotalRisk).map(([key, value]) => {
        const riskName = invert(SEVERITY_MAP)[key];
        const normalizedRiskName = riskName.split('-')[0];
        const translatedTotalRisk = (TOTAL_RISK_LABEL[key].props && TOTAL_RISK_LABEL[key].props.children) || '';

        if (value) {
            return <SummaryChartItem
                key={`${riskName}-value`}
                riskName={normalizedRiskName}
                name={translatedTotalRisk}
                numIssues={value}
                affectedSystems={totalIssues[key]} />;
        } else {
            noHits.push(<span id={`${translatedTotalRisk}`}>
                {intl.formatMessage(messages.summaryChartItemNoHits, { severity: translatedTotalRisk }) + ' '}
            </span>);
        }
    });
    const rulesWithHits = hitsBuilder(rulesTotalRisk, reportsTotalRisk).reverse();

    return <Stack
        style={{ marginTop: 18 }}
        aria-label='Rule hits by severity' widget-type='InsightsSummaryChart'>
        {rulesWithHits.filter(Boolean).length > 0 ?
            <React.Fragment>
                {rulesWithHits}
                {noHits.length > 0 &&
                    <StackItem className="disabled border-top">
                        <p>{noHits}</p>
                    </StackItem>
                }
            </React.Fragment>
            : <p>{intl.formatMessage(messages.summaryChartNoHits)}</p>
        }
    </Stack>;
};

SummaryChart.propTypes = {
    rulesTotalRisk: PropTypes.object,
    reportsTotalRisk: PropTypes.object,
    intl: PropTypes.any
};

export default injectIntl(SummaryChart);
