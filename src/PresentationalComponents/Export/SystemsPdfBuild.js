/* eslint-disable camelcase */
// import { Battery, Chart, Column, Panel, PanelItem, Paragraph, Section, Table } from '@redhat-cloud-services/frontend-components-pdf-generator';

import PropTypes from 'prop-types';
import React from 'react';
// import { Text } from '@react-pdf/renderer';
import messages from '../../Messages';

const BuildReport = ({ systems, filters, intl }) => {
    console.error(systems, filters);
    // const severityRows = [[intl.formatMessage(messages.severity), intl.formatMessage(messages.poundOfRecs)],
    // ...Object.entries(statsReports.total_risk).map(([key, value]) =>
    //     [TOTAL_RISK_LABEL[key].props.children, intl.formatMessage(messages.recNumAndPercentage, {
    //         count: value,
    //         total: Math.round(Number(value / statsReports.total * 100))
    //     })]).reverse()
    // ];

    // const categoryRows = [[intl.formatMessage(messages.category), intl.formatMessage(messages.poundOfRecs)],
    // ...Object.entries(statsReports.category).map(([key, value]) =>
    //     [key, intl.formatMessage(messages.recNumAndPercentage, {
    //         count: value,
    //         total: Math.round(Number(value / statsReports.total * 100))
    //     })])];

    // const rulesDesc = (rule) => <Text>
    //     <Text style={{ fontWeight: 700 }}> {rule.description}</Text>&nbsp;{truncate(rule.summary, { length: 280 })}
    // </Text>;

    return <React.Fragment key={`${intl.formatMessage(messages.insightsHeader)}: ${intl.formatMessage(messages.systems)}`}>

    </React.Fragment>;
};

BuildReport.propTypes = {
    systems: PropTypes.object,
    filters: PropTypes.object,
    tags: PropTypes.array,
    intl: PropTypes.any
};

export default BuildReport;
