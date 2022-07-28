/* eslint-disable react/prop-types */
import './Pathways.scss';

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

import { Text } from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import CategoryLabel from '../Labels/CategoryLabel';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Link } from 'react-router-dom';
import { RISK_OF_CHANGE_LABEL } from '../../AppConstants';
import React from 'react';
import { RebootRequired } from '../Common/Common';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';
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
      className="adv-c-card-pathway adv__background--global-100"
    >
      <CardBody className="body">
        <Text className="pf-u-pb-sm pf-u-font-weight-bold">{name}</Text>
        <CategoryLabel key={name} labelList={categories} />{' '}
        <Link
          to={`/recommendations/pathways/systems/${slug}`}
          className="pf-u-font-size-sm"
        >
          {intl.formatMessage(messages.topicCardSystemsaffected, {
            systems: impacted_systems_count,
          })}
        </Link>
      </CardBody>
      <CardBody className="body pf-u-font-size-sm">{description}</CardBody>
      <CardBody className="body pf-u-font-size-sm">
        {has_incident && (
          <RuleLabels rule={{ tags: 'incident' }} isCompact noMargin={true} />
        )}{' '}
        {RebootRequired(reboot_required)}
      </CardBody>
      <CardFooter className="footer pf-u-font-size-sm">
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
const Resolution = (props) => {
  const intl = useIntl();
  const { reboot_required, name, resolution_risk } = props;

  return (
    <Card
      isFlat
      isPlain
      className="adv-c-card-pathway adv__background--global-100 pf-u-h-100 flex-row"
    >
      <div className="flex-coloumn">
        <CardTitle>{intl.formatMessage(messages.resolution)}</CardTitle>

        <div className="flex-row ">
          <div className="halfWidth">
            <p className="pf-u-font-weight-bold pf-u-font-size-sm pf-u-pl-lg">
              {intl.formatMessage(messages.remediation)}
            </p>
            <p className="pf-u-font-size-sm pf-u-pl-lg">{name}</p>
          </div>

          <CardBody className=" pf-u-pl-xl halfWidth">
            <p className="pf-u-font-weight-bold pf-u-font-size-sm">
              {intl.formatMessage(messages.riskOfChange)}
            </p>
            <InsightsLabel
              text={RISK_OF_CHANGE_LABEL[resolution_risk.risk]}
              value={resolution_risk.risk}
              hideIcon
              isCompact
            />
          </CardBody>
        </div>

        <CardBody className="body pf-u-font-size-sm">
          {intl.formatMessage(messages.staticRemediationDesc)}
        </CardBody>
        <CardBody className="body">{RebootRequired(reboot_required)}</CardBody>
      </div>

      <div className="pathwayRight pf-u-p-lg ">
        <p className="pf-u-font-weight-bold pf-u-font-size-sm">
          {intl.formatMessage(messages.reclvl)}
        </p>
        <div>
          <RecommendationLevel {...props} />
        </div>
      </div>
    </Card>
  );
};

export { PathwayCard, TotalRisk, Resolution };
