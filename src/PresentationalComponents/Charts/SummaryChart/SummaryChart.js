import React from 'react';
import PropTypes from 'prop-types';
import { invert } from 'lodash';
import { Stack, StackItem } from '@patternfly/react-core';
import { SEVERITY_MAP, TOTAL_RISK_LABEL } from '../../../AppConstants';
import asyncComponent from '../../../Utilities/asyncComponent';
import './SummaryChart.scss';

const SummaryChartItem = asyncComponent(() => import('./SummaryChartItem'));

const SummaryChart = (props) => {
    const noHits = [];
    const hitsBuilder = (rulesTotalRisk, totalIssues) => Object.entries(rulesTotalRisk).map(([key, value]) => {
        const riskName = invert(SEVERITY_MAP)[key];
        const normalizedRiskName = riskName.split('-')[0];
        if (value) {
            return <SummaryChartItem
                key={ `${riskName}-value` }
                riskName={ normalizedRiskName }
                name={ TOTAL_RISK_LABEL[key] }
                numIssues={ value }
                affectedSystems={ totalIssues[key] }/>;
        } else {
            noHits.push(`No ${TOTAL_RISK_LABEL[key]} hits. `);
        }
    });
    const rulesWithHits = hitsBuilder(props.rulesTotalRisk, props.reportsTotalRisk).reverse();

    return <Stack
        style={ { marginTop: 18 } }
        aria-label='Rule hits by severity' widget-type='InsightsSummaryChart'>
        { rulesWithHits.filter(Boolean).length > 0 ?
            <>
                { rulesWithHits }
                { noHits.length > 0 &&
                <StackItem className="disabled border-top">
                    <p>{ noHits }</p>
                </StackItem>
                }
            </>
            : <p>{ `Your connected systems have no rule hits.` }</p>
        }
    </Stack>;
};

SummaryChart.propTypes = {
    rulesTotalRisk: PropTypes.object,
    reportsTotalRisk: PropTypes.object
};

export default SummaryChart;
