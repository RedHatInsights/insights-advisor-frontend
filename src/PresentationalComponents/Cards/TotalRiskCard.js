/* eslint-disable react/prop-types */
import './Pathways.scss';

import {
  Card,
  CardBody,
  CardTitle,
} from '@patternfly/react-core/dist/esm/components/Card/index';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';
import {
  t_chart_global_danger_color_100,
  t_chart_global_warning_color_100,
  t_chart_global_warning_color_200,
  t_chart_color_black_300,
  t_global_text_color_regular,
  t_global_border_color_default,
} from '@patternfly/react-tokens';

import React from 'react';
import messages from '../../Messages';
import { strong } from '../../Utilities/intlHelper';
import { useIntl } from 'react-intl';

export const TotalRiskCard = (props) => {
  const intl = useIntl();
  const {
    impacted_systems_count,
    incident_count,
    categories,
    critical_risk_count,
    high_risk_count,
    medium_risk_count,
    low_risk_count,
  } = props;

  const catString = (cats) =>
    cats.length > 1
      ? categories.map((cat) => cat.name).join(', ')
      : cats[0]?.name;
  return (
    <Card
      isPlain
      className="adv-c-card-pathway adv__background--global-100 pf-v6-u-h-100"
      ouiaId="total-risk-card"
    >
      <CardTitle>{intl.formatMessage(messages.totalRiskPathway)}</CardTitle>
      <CardBody className="body">
        <Grid hasGutter>
          <GridItem span={6}>
            <div>
              <Chart
                ariaDesc="Total risk of recommendations"
                ariaTitle="Total risk of recommendations"
                containerComponent={
                  <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.name}: ${datum.y}`}
                    constrainToVisibleArea
                  />
                }
                domainPadding={{
                  x: [20, 15],
                }}
                height={150}
                width={300}
                padding={{
                  bottom: 30,
                  left: 45,
                  right: 10,
                  top: 10,
                }}
              >
                <ChartAxis
                  style={{
                    tickLabels: { fill: t_global_text_color_regular.var },
                    axis: { stroke: t_global_border_color_default.var },
                  }}
                />
                <ChartAxis
                  dependentAxis
                  showGrid
                  style={{
                    tickLabels: { fill: t_global_text_color_regular.var },
                    axis: { stroke: t_global_border_color_default.var },
                    grid: { stroke: t_global_border_color_default.var },
                  }}
                />
                <ChartGroup>
                  <ChartBar
                    barWidth={16}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill,
                      },
                    }}
                    data={[
                      {
                        name: 'Critical',
                        x: 'Critical',
                        y: critical_risk_count,
                        fill: t_chart_global_danger_color_100.var,
                      },
                      {
                        name: 'Important',
                        x: 'Important',
                        y: high_risk_count,
                        fill: t_chart_global_warning_color_100.var,
                      },
                      {
                        name: 'Moderate',
                        x: 'Moderate',
                        y: medium_risk_count,
                        fill: t_chart_global_warning_color_200.var,
                      },
                      {
                        name: 'Low',
                        x: 'Low',
                        y: low_risk_count,
                        fill: t_chart_color_black_300.var,
                      },
                    ]}
                  />
                </ChartGroup>
              </Chart>
            </div>
          </GridItem>
          <GridItem span={6} className="pf-v6-u-font-size-sm">
            {intl.formatMessage(messages.thisPathway, {
              category: catString(categories),
              systems: impacted_systems_count,
              incidents: incident_count,
              strong: (str) => strong(str),
            })}
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};
