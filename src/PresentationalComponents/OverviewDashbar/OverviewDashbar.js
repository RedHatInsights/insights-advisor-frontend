import React from 'react';
import propTypes from 'prop-types';

import useApplyFilters from './Hooks/useApplyFilters/useApplyFilters';
import useOverviewData from './Hooks/useOverviewData/useOverviewData';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { OverviewDashbarCard } from '../Cards/OverviewDashbarCard/OverviewDashbarCard';
import MessageState from '../MessageState/MessageState';
import messages from '../../Messages';
import {
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  PATHWAYS_TAB,
  INCIDENT_TAG,
  CRITICAL_TAG,
  SEVERITY_MAP,
  IMPORTANT_TAG,
} from '../../AppConstants';
import { QuestionTooltip } from '../Common/Common';
import { RouteIcon } from '@patternfly/react-icons';
import RuleLabels from '../Labels/RuleLabels';
import { TagLabelWithTooltip } from '../Cards/OverviewDashbarCard/TagLabelWithTooltip';

const OverviewDashbar = ({ changeTab }) => {
  const { data } = useOverviewData();
  const { pathways, incidents, critical, important, loaded, isError } = data;

  const { applyFiltersByTitle } = useApplyFilters(changeTab);

  return !isError ? (
    <Grid hasGutter id="overview-dashbar">
      <GridItem span={12} md={3}>
        <OverviewDashbarCard
          isLoaded={loaded}
          title={
            <Title headingLevel="h6" size="md">
              {messages.pathways.defaultMessage}
              <QuestionTooltip
                text={messages.recommendedPathways.defaultMessage}
              />
            </Title>
          }
          badge={<RouteIcon size="md" data-testid="route-icon" />}
          count={pathways}
          onClickFilterByTitle={() => {
            changeTab(PATHWAYS_TAB);
          }}
        />
      </GridItem>
      <GridItem span={12} md={3}>
        <OverviewDashbarCard
          isLoaded={loaded}
          title={
            <Title headingLevel="h6" size="md">
              {messages.incidents.defaultMessage}
              <QuestionTooltip text={messages.incidentTooltip.defaultMessage} />
            </Title>
          }
          badge={
            <RuleLabels
              key="incidentTag"
              noMargin
              isCompact
              rule={{ tags: INCIDENT_TAG }}
            />
          }
          count={incidents}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={12} md={3}>
        <OverviewDashbarCard
          isLoaded={loaded}
          title={
            <Title headingLevel="h6" size="md">
              {CRITICAL_RECOMMENDATIONS}
            </Title>
          }
          badge={<TagLabelWithTooltip typeOfTag={SEVERITY_MAP[CRITICAL_TAG]} />}
          count={critical}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={12} md={3}>
        <OverviewDashbarCard
          isLoaded={loaded}
          title={
            <Title headingLevel="h6" size="md">
              {IMPORTANT_RECOMMENDATIONS}
            </Title>
          }
          badge={
            <TagLabelWithTooltip typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]} />
          }
          count={important}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
    </Grid>
  ) : (
    <MessageState
      icon={'none'}
      title={messages.noOverviewAvailable.defaultMessage}
      text={messages.overviewDashbarError.defaultMessage}
    />
  );
};

OverviewDashbar.propTypes = {
  changeTab: propTypes.func,
};

export default OverviewDashbar;
