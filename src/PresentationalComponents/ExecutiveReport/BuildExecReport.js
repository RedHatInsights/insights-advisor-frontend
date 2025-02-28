import {
  Chart,
  Column,
  InsightsLabel,
  Panel,
  PanelItem,
  Paragraph,
  Section,
  Table,
} from '@redhat-cloud-services/frontend-components-pdf-generator/dist/esm/index';

import PropTypes from 'prop-types';
import React from 'react';
import { TOTAL_RISK_LABEL } from '../../AppConstants';
import messages from '../../Messages';
import { truncate } from 'lodash';
import { Text } from '@react-pdf/renderer';
import {
  STATS_SYSTEMS_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  RULES_FETCH_URL,
} from '../../AppConstants';

export const fetchData = async (createAsyncRequest, options) => {
  const statsReports = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: STATS_SYSTEMS_FETCH_URL,
  });
  const statsSystems = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: STATS_REPORTS_FETCH_URL,
  });

  const topActiveRec = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: RULES_FETCH_URL,
    params: {
      limit: options.limit,
      sort: options.sort,
      impacting: options.impacting,
    },
  });

  const data = await Promise.all([statsReports, statsSystems, topActiveRec]);
  return data;
};

const BuildExecReport = ({
  statsSystems,
  statsReports,
  topActiveRec,
  intl,
}) => {
  const calcPercent = (value, total) =>
    Math.round(Number((value / total) * 100));
  const severityPie = [
    {
      x: intl.formatMessage(messages.critical),
      y: calcPercent(statsReports.total_risk[4], statsReports.total),
    },
    {
      x: intl.formatMessage(messages.important),
      y: calcPercent(statsReports.total_risk[3], statsReports.total),
    },
    {
      x: intl.formatMessage(messages.moderate),
      y: calcPercent(statsReports.total_risk[2], statsReports.total),
    },
    {
      x: intl.formatMessage(messages.low),
      y: calcPercent(statsReports.total_risk[1], statsReports.total),
    },
  ];
  const severityRows = [
    [
      intl.formatMessage(messages.severity),
      intl.formatMessage(messages.poundOfRecs),
    ],
    ...Object.entries(statsReports.total_risk)
      .map(([key, value]) => [
        TOTAL_RISK_LABEL[key].props.children,
        intl.formatMessage(messages.recNumAndPercentage, {
          count: value,
          total: calcPercent(value, statsReports.total),
        }),
      ])
      .reverse(),
  ];

  const categoryPie = [
    {
      x: intl.formatMessage(messages.availability),
      y: calcPercent(statsReports.category.Availability, statsReports.total),
    },
    {
      x: intl.formatMessage(messages.performance),
      y: calcPercent(statsReports.category.Performance, statsReports.total),
    },
    {
      x: intl.formatMessage(messages.security),
      y: calcPercent(statsReports.category.Security, statsReports.total),
    },
    {
      x: intl.formatMessage(messages.stability),
      y: calcPercent(statsReports.category.Stability, statsReports.total),
    },
  ];
  const categoryRows = [
    [
      intl.formatMessage(messages.category),
      intl.formatMessage(messages.poundOfRecs),
    ],
    ...Object.entries(statsReports.category).map(([key, value]) => [
      key,
      intl.formatMessage(messages.recNumAndPercentage, {
        count: value,
        total: calcPercent(value, statsReports.total),
      }),
    ]),
  ];

  const rulesDesc = (rule) => (
    <Text>
      <Text style={{ fontWeight: 700 }}> {rule.description}</Text>&nbsp;
      {truncate(rule.summary, { length: 280 })}
    </Text>
  );

  return (
    <React.Fragment key={intl.formatMessage(messages.insightsHeader)}>
      <Paragraph>
        {intl.formatMessage(messages.execReportHeader, {
          systems: (
            <Text style={{ fontWeight: 700 }}>
              {intl.formatMessage(messages.execReportHeaderSystems, {
                systems: statsSystems.total,
              })}
            </Text>
          ),
          risks: (
            <Text style={{ fontWeight: 700 }}>
              {' '}
              {intl.formatMessage(messages.execReportHeaderRisks, {
                risks: statsReports.total,
              })}
            </Text>
          ),
        })}
      </Paragraph>
      <Section title={intl.formatMessage(messages.severityHeader)}>
        <Column>
          <Table withHeader rows={severityRows} />
        </Column>
        <Column>
          <Chart
            chartType="pie"
            subTitle={intl.formatMessage(messages.severityHeader)}
            title="100"
            data={severityPie}
            colorSchema={'multi'}
          />
        </Column>
      </Section>
      <Section title={intl.formatMessage(messages.categoryHeader)}>
        <Column>
          <Table withHeader rows={categoryRows} />
        </Column>
        <Column>
          <Chart
            chartType="pie"
            subTitle={intl.formatMessage(messages.categoryHeader)}
            title="100"
            data={categoryPie}
          />
        </Column>
      </Section>
      <Section
        title={intl.formatMessage(messages.top3RulesHeader)}
        withColumn={false}
      >
        {topActiveRec.data.map((rule, key) => (
          <Panel key={key} description={rulesDesc(rule)}>
            <PanelItem
              title={intl.formatMessage(messages.systemsExposed)}
            >{`${rule.impacted_systems_count}`}</PanelItem>
            <PanelItem title={intl.formatMessage(messages.totalRisk)}>
              <InsightsLabel variant={rule.total_risk} />
            </PanelItem>
          </Panel>
        ))}
      </Section>
    </React.Fragment>
  );
};

BuildExecReport.propTypes = {
  statsSystems: PropTypes.object,
  statsReports: PropTypes.object,
  topActiveRec: PropTypes.object,
  intl: PropTypes.any,
};

export default BuildExecReport;
