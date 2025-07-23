import PropTypes from 'prop-types';
import React from 'react';
import {
  CATEGORY,
  CATEGORY_CONSTANTS,
  CATEGORY_HEADER,
  EXEC_REPORT_HEADER,
  EXEC_REPORT_HEADER_RISKS,
  EXEC_REPORT_HEADER_SYSTEMS,
  INSIGHTS_HEADER,
  REC_NUM_AND_PERCENTAGE,
  RULES_FETCH_URL,
  SEVERITY,
  SEVERITY_HEADER,
  STATS_SYSTEMS_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  SYSTEMS_EXPOSED,
  TOP_THREE_RULES_HEADER,
  TOTAL_RISK,
  TOTAL_RISK_CONSTANTS,
  TOTAL_RISK_LABEL,
} from '../../AppConstants';
import { truncate } from 'lodash';
import { Text } from '@react-pdf/renderer';
import { Flex, FlexItem } from '@patternfly/react-core';
import chart_color_red_100 from '@patternfly/react-tokens/dist/js/chart_color_red_100';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import global_Color_dark_200 from '@patternfly/react-tokens/dist/js/global_Color_dark_200';
import RecommendationCharts from './RecommendationCharts';

/**
 * fetchData must remain in the same file as the template per pdf-generator
 */
export const fetchData = async (createAsyncRequest) => {
  const statsReports = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: STATS_REPORTS_FETCH_URL,
  });
  const statsSystems = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: STATS_SYSTEMS_FETCH_URL,
  });

  const topActiveRec = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: RULES_FETCH_URL,
    params: {
      limit: 3,
      sort: '-total_risk,-impacted_count',
      impacting: true,
    },
  });

  const data = await Promise.all([statsReports, statsSystems, topActiveRec]);
  return data;
};

const BuildExecReport = ({ asyncData }) => {
  const [statsReports, statsSystems, topActiveRec] = asyncData.data;
  const calcPercent = (value, total) =>
    Math.round(Number((value / total) * 100));
  const severityPie = [
    {
      x: TOTAL_RISK_CONSTANTS.CRITICAL,
      y: calcPercent(statsReports.total_risk[4], statsReports.total),
    },
    {
      x: TOTAL_RISK_CONSTANTS.IMPORTANT,
      y: calcPercent(statsReports.total_risk[3], statsReports.total),
    },
    {
      x: TOTAL_RISK_CONSTANTS.MODERATE,
      y: calcPercent(statsReports.total_risk[2], statsReports.total),
    },
    {
      x: TOTAL_RISK_CONSTANTS.LOW,
      y: calcPercent(statsReports.total_risk[1], statsReports.total),
    },
  ];

  const severityLegend = [
    {
      name: `${TOTAL_RISK_CONSTANTS.CRITICAL}`,
    },
    {
      name: `${TOTAL_RISK_CONSTANTS.IMPORTANT}`,
    },
    {
      name: `${TOTAL_RISK_CONSTANTS.MODERATE}`,
    },
    {
      name: `${TOTAL_RISK_CONSTANTS.LOW}`,
    },
  ];

  const severityRows = Object.entries(statsReports.total_risk)
    .map(([key, value]) => [
      TOTAL_RISK_LABEL[key].props.children,
      REC_NUM_AND_PERCENTAGE(value, calcPercent(value, statsReports.total)),
    ])
    .reverse();

  const categoryPie = [
    {
      x: CATEGORY_CONSTANTS.AVAILABILITY,
      y: calcPercent(statsReports.category.Availability, statsReports.total),
    },
    {
      x: CATEGORY_CONSTANTS.PERFORMANCE,
      y: calcPercent(statsReports.category.Performance, statsReports.total),
    },
    {
      x: CATEGORY_CONSTANTS.SECURITY,
      y: calcPercent(statsReports.category.Security, statsReports.total),
    },
    {
      x: CATEGORY_CONSTANTS.STABILITY,
      y: calcPercent(statsReports.category.Stability, statsReports.total),
    },
  ];

  const categoryLegend = [
    {
      name: `${CATEGORY_CONSTANTS.AVAILABILITY}`,
    },
    {
      name: `${CATEGORY_CONSTANTS.PERFORMANCE}`,
    },
    {
      name: `${CATEGORY_CONSTANTS.SECURITY}`,
    },
    {
      name: `${CATEGORY_CONSTANTS.STABILITY}`,
    },
  ];

  const categoryRows = Object.entries(statsReports.category).map(
    ([key, value]) => [
      key,
      REC_NUM_AND_PERCENTAGE(value, calcPercent(value, statsReports.total)),
    ],
  );

  const rulesDesc = (rule) => (
    <Text>
      <Text style={{ fontWeight: 700 }}> {rule.description}</Text>&nbsp;
      {truncate(rule.summary, { length: 280 })}
    </Text>
  );

  return (
    <div
      style={{ paddingTop: '24px', paddingLeft: '32px', paddingRight: '32px' }}
    >
      <span style={{ fontSize: '24px', color: chart_color_red_100.value }}>
        Red Hat Insights
      </span>
      <br />
      <span style={{ fontSize: '32px', color: chart_color_red_100.value }}>
        {`Executive report: ${INSIGHTS_HEADER}`}
      </span>
      <br />
      <Text style={{ fontSize: '12px' }}>
        {EXEC_REPORT_HEADER(
          EXEC_REPORT_HEADER_SYSTEMS(statsSystems.total),
          EXEC_REPORT_HEADER_RISKS(statsReports.total),
        )}
      </Text>
      <br />
      <br />
      <RecommendationCharts
        columnHeader={SEVERITY}
        header={SEVERITY_HEADER}
        pieChart={severityPie}
        pieLegend={severityLegend}
        rows={severityRows}
      />
      <RecommendationCharts
        columnHeader={CATEGORY}
        header={CATEGORY_HEADER}
        pieChart={categoryPie}
        pieLegend={categoryLegend}
        rows={categoryRows}
      />
      <Text style={{ color: chart_color_red_100.value }}>
        {TOP_THREE_RULES_HEADER}
      </Text>
      {topActiveRec.data.map((rule, key) => (
        <Flex style={{ paddingTop: '24px' }} key={key}>
          <Flex direction={{ default: 'column' }}>
            <FlexItem
              style={{
                fontSize: '12px',
                color: global_Color_dark_200.value,
              }}
            >
              {SYSTEMS_EXPOSED}
            </FlexItem>
            <FlexItem style={{ fontSize: '32px' }}>
              {rule.impacted_systems_count}
            </FlexItem>
          </Flex>
          <Flex direction={{ default: 'column' }}>
            <FlexItem
              style={{
                fontSize: '12px',
                color: global_Color_dark_200.value,
              }}
            >
              {TOTAL_RISK}
            </FlexItem>
            <FlexItem style={{ paddingTop: '8px' }}>
              <InsightsLabel value={rule.total_risk} />
            </FlexItem>
          </Flex>
          <Flex
            flex={{ default: 'flex_1' }}
            alignSelf={{ default: 'alignSelfStretch' }}
          >
            <FlexItem style={{ fontSize: '12px' }}>{rulesDesc(rule)}</FlexItem>
          </Flex>
        </Flex>
      ))}
    </div>
  );
};

BuildExecReport.propTypes = {
  asyncData: PropTypes.object,
};

export default BuildExecReport;
