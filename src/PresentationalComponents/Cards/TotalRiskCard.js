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
} from '@patternfly/react-charts';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/esm/layouts/Grid/index';

import React from 'react';
import chart_color_black_100 from '@patternfly/react-tokens/dist/esm/chart_color_black_100';
import chart_color_gold_400 from '@patternfly/react-tokens/dist/esm/chart_color_gold_400';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_red_100 from '@patternfly/react-tokens/dist/esm/chart_color_red_100';
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
      isFlat
      isPlain
      className="adv-c-card-pathway adv__background--global-100 pf-u-h-100"
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
                <ChartAxis />
                <ChartAxis dependentAxis showGrid />
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
                        fill: chart_color_red_100.value,
                      },
                      {
                        name: 'Important',
                        x: 'Important',
                        y: high_risk_count,
                        fill: chart_color_orange_300.value,
                      },
                      {
                        name: 'Moderate',
                        x: 'Moderate',
                        y: medium_risk_count,
                        fill: chart_color_gold_400.value,
                      },
                      {
                        name: 'Low',
                        x: 'Low',
                        y: low_risk_count,
                        fill: chart_color_black_100.value,
                      },
                    ]}
                  />
                </ChartGroup>
              </Chart>
            </div>
          </GridItem>
          <GridItem span={6} className="pf-u-font-size-sm">
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
