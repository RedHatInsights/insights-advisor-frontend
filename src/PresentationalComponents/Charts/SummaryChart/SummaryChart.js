import React from 'react';
import PropTypes from 'prop-types';
import { capitalize, invert } from 'lodash';
import { Stack, StackItem } from '@patternfly/react-core';
import { SEVERITY_MAP } from '../../../AppConstants';
import asyncComponent from '../../../Utilities/asyncComponent';
import './SummaryChart.scss';

const SummaryChartItem = asyncComponent(() => import('./SummaryChartItem'));

const SummaryChart = (props) => {
    const noHits = [];
    const hitsBuilder = (totalRisk, totalIssues) => Object.entries(totalRisk).map(([ key, value ]) => {
        const riskName = invert(SEVERITY_MAP)[key];
        const normalizedRiskName = capitalize(riskName.split('-')[0]);
        if (value) {
            return <SummaryChartItem
                key={ `${riskName}-value` }
                riskName={ riskName }
                name={ normalizedRiskName }
                numIssues={ value }
                affectedSystems={ totalIssues }/>;
        } else {
            noHits.push(`No ${normalizedRiskName.toLocaleLowerCase()} hits.`);
        }
    });
    const rulesWithHits = hitsBuilder(props.totalRisk, props.totalIssues).reverse();

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
    totalRisk: PropTypes.object,
    totalIssues: PropTypes.number
};

export default SummaryChart;
