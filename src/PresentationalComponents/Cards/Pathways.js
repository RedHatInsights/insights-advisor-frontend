/* eslint-disable react/prop-types */
import {
  Card,
  CardBody,
  CardFooter,
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

import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import CategoryLabel from '../Labels/CategoryLabel';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Link } from 'react-router-dom';
import { RISK_OF_CHANGE_LABEL } from '../../AppConstants';
import React from 'react';
import { RebootRequired } from '../Common/Common';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import chart_color_black_100 from '@patternfly/react-tokens/dist/esm/chart_color_black_100';
import chart_color_gold_400 from '@patternfly/react-tokens/dist/esm/chart_color_gold_400';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_red_100 from '@patternfly/react-tokens/dist/esm/chart_color_red_100';
import messages from '../../Messages';
import { strong } from '../../Utilities/intlHelper';
import { useIntl } from 'react-intl';

const PathwayCard = (props) => {
  const intl = useIntl();
  const {
    name,
    categories,
    impacted_systems_count,
    description,
    has_incident,
    reboot_required,
    slug,
  } = props;

  return (
    <Card
      isFlat
      isPlain
      className={`adv-c-card-pathway adv__background--global-100`}
    >
      <CardBody className={`body`}>
        <CategoryLabel key={name} labelList={categories} />{' '}
        <Link to={`/recommendations/pathways/${slug}`}>
          {intl.formatMessage(messages.topicCardSystemsaffected, {
            systems: impacted_systems_count,
          })}
        </Link>
      </CardBody>
      <CardBody className={`body`}>{description}</CardBody>
      <CardBody className={`body`}>
        {has_incident && <RuleLabels rule={{ tags: 'incident' }} />}{' '}
        {RebootRequired(reboot_required)}
      </CardBody>
      <CardFooter className={`footer`}>
        <Link to={`/recommendations/pathways/${slug}`}>
          {`${intl.formatMessage(messages.viewPathway)} `}
          <ArrowRightIcon />
        </Link>
      </CardFooter>
    </Card>
  );
};
const TotalRisk = (props) => {
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
    cats.length > 1 ? categories.map((cat) => cat.name).join(', ') : cats.name;
  return (
    <Card
      isFlat
      isPlain
      className={`adv-c-card-pathway adv__background--global-100`}
    >
      <CardTitle>{intl.formatMessage(messages.totalRiskPathway)}</CardTitle>
      <CardBody className={`body`}>
        <Grid>
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
                height={300}
                width={300}
                padding={{
                  bottom: 30,
                  left: 35,
                  right: 20,
                  top: 10,
                }}
              >
                <ChartAxis />
                <ChartAxis dependentAxis showGrid />
                <ChartGroup>
                  <ChartBar
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
          <GridItem span={6}>
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
const Resolution = (props) => {
  const intl = useIntl();
  const { description, reboot_required, name, resolution_risk } = props;

  return (
    <Card
      isFlat
      isPlain
      className={`adv-c-card-pathway adv__background--global-100`}
    >
      <CardTitle>{intl.formatMessage(messages.resolution)}</CardTitle>
      <Grid>
        <GridItem span={7}>
          <CardBody className={`body`}>
            <InsightsLabel
              text={RISK_OF_CHANGE_LABEL[resolution_risk.risk]}
              value={resolution_risk.risk}
              hideIcon
            />
          </CardBody>
          <CardBody className={`body`}>
            <Title headingLevel="h5" size="md">
              {name}
            </Title>
          </CardBody>

          <CardBody className={`body`}>{description}</CardBody>
          <CardBody className={`body`}>
            {RebootRequired(reboot_required)}
          </CardBody>
        </GridItem>
        <GridItem span={5}>
          <CardTitle>{intl.formatMessage(messages.reclvl)}</CardTitle>
          <RecommendationLevel {...props} />
        </GridItem>
      </Grid>
    </Card>
  );
};

export { PathwayCard, TotalRisk, Resolution };
