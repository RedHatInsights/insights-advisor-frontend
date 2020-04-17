/* eslint-disable camelcase */
import { Battery, Chart, Column, Panel, PanelItem, Paragraph, Section, Table } from '@redhat-cloud-services/frontend-components-pdf-generator';

import PropTypes from 'prop-types';
import React from 'react';
import { TOTAL_RISK_LABEL } from '../../AppConstants';
import { Text } from '@react-pdf/renderer';
import messages from '../../Messages';
import { truncate } from 'lodash';

const BuildExecReport = ({ statsSystems, statsReports, topActiveRec, intl }) => {
    const batteryMap = {
        1: 'low',
        2: 'medium',
        3: 'high',
        4: 'critical'
    };
    const severityPie = [
        { x: intl.formatMessage(messages.critical), y: statsReports.total_risk[4] },
        { x: intl.formatMessage(messages.important), y: statsReports.total_risk[3] },
        { x: intl.formatMessage(messages.moderate), y: statsReports.total_risk[2] },
        { x: intl.formatMessage(messages.low), y: statsReports.total_risk[1] }];
    const severityRows = [[intl.formatMessage(messages.severity), intl.formatMessage(messages.numberRuleHits)],
        ...Object.entries(statsReports.total_risk).map(([key, value]) =>
            [TOTAL_RISK_LABEL[key].props.children, intl.formatMessage(messages.recNumAndPercentage, {
                count: value,
                total: Math.round(Number(value / statsReports.total * 100))
            })]).reverse()
    ];

    const categoryPie = [
        { x: intl.formatMessage(messages.availability), y: statsReports.category.Availability },
        { x: intl.formatMessage(messages.performance), y: statsReports.category.Performance },
        { x: intl.formatMessage(messages.security), y: statsReports.category.Security },
        { x: intl.formatMessage(messages.stability), y: statsReports.category.Stability }
    ];
    const categoryRows = [[intl.formatMessage(messages.category), intl.formatMessage(messages.numberRuleHits)],
        ...Object.entries(statsReports.category).map(([key, value]) =>
            [key, intl.formatMessage(messages.recNumAndPercentage, {
                count: value,
                total: Math.round(Number(value / statsReports.total * 100))
            })])];

    const rulesDesc = (rule) => <Text>
        <Text style={{ fontWeight: 700 }}> {rule.description}</Text>&nbsp;{truncate(rule.summary, { length: 280 })}
    </Text>;

    return <React.Fragment key={intl.formatMessage(messages.insightsHeader)}>
        <Paragraph>
            {intl.formatMessage(messages.execReportHeader, {
                systems: <Text style={{ fontWeight: 700 }}>
                    {intl.formatMessage(messages.execReportHeaderSystems, { systems: statsSystems.total })}
                </Text>,
                risks: <Text style={{ fontWeight: 700 }}> {intl.formatMessage(messages.execReportHeaderRisks, { risks: statsReports.total })}</Text>
            })}
        </Paragraph>
        <Section title={intl.formatMessage(messages.severityHeader)}>
            <Column><Table withHeader rows={severityRows} /></Column>
            <Column>
                <Chart
                    chartType="pie"
                    subTitle={intl.formatMessage(messages.severityHeader)}
                    title='100'
                    data={severityPie}
                    colorSchema={'multi'}
                />
            </Column>
        </Section>
        <Section title={intl.formatMessage(messages.categoryHeader)}>
            <Column><Table withHeader rows={categoryRows} /></Column>
            <Column>
                <Chart
                    chartType="pie"
                    subTitle={intl.formatMessage(messages.categoryHeader)}
                    title='100'
                    data={categoryPie} />
            </Column>
        </Section>
        <Section title={intl.formatMessage(messages.top3RulesHeader)} withColumn={false}>
            {topActiveRec.data.map((rule, key) =>
                <Panel key={key} description={rulesDesc(rule)}>
                    <PanelItem title={intl.formatMessage(messages.systemsExposed)}>{`${rule.impacted_systems_count}`}</PanelItem>
                    <PanelItem title={intl.formatMessage(messages.totalRisk)}><Battery variant={batteryMap[rule.total_risk]} /></PanelItem>
                </Panel>)}
        </Section>
    </React.Fragment>;
};

BuildExecReport.propTypes = {
    statsSystems: PropTypes.object,
    statsReports: PropTypes.object,
    topActiveRec: PropTypes.object,
    intl: PropTypes.any
};

export default BuildExecReport;
