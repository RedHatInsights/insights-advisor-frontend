import React, { useContext } from 'react';
import propTypes from 'prop-types';
import { useIntl } from 'react-intl';

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
  PATHWAYS,
  INCIDENTS,
} from '../../AppConstants';
import { QuestionTooltip } from '../Common/Common';
import { RouteIcon } from '@patternfly/react-icons';
import { TagLabelWithTooltip } from '../Cards/OverviewDashbarCard/TagLabelWithTooltip';
import { EnvironmentContext } from '../../App';
import RuleLabels from '../Labels/RuleLabels';

const OverviewDashbar = ({ changeTab }) => {
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);
  const { data } = useOverviewData(envContext);
  const { pathways, incidents, critical, important, loaded, isError } = data;
  const mdSpan = envContext.displayRecPathways ? 3 : 4;

  const { onClickFilterByName } = useApplyFilters(changeTab);

  return !isError ? (
    <Grid hasGutter id="overview-dashbar">
      {envContext.displayRecPathways && (
        <GridItem span={12} md={mdSpan}>
          <OverviewDashbarCard
            name={PATHWAYS}
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
            onClickFilterByName={() => {
              changeTab(PATHWAYS_TAB);
            }}
          />
        </GridItem>
      )}
      <GridItem span={12} md={mdSpan}>
        <OverviewDashbarCard
          name={INCIDENTS}
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
              intl={intl}
            />
          }
          count={incidents}
          onClickFilterByName={onClickFilterByName}
        />
      </GridItem>
      <GridItem span={12} md={mdSpan}>
        <OverviewDashbarCard
          name={CRITICAL_RECOMMENDATIONS}
          isLoaded={loaded}
          title={
            <Title headingLevel="h6" size="md">
              {CRITICAL_RECOMMENDATIONS}
            </Title>
          }
          badge={<TagLabelWithTooltip typeOfTag={SEVERITY_MAP[CRITICAL_TAG]} />}
          count={critical}
          onClickFilterByName={onClickFilterByName}
        />
      </GridItem>
      <GridItem span={12} md={mdSpan}>
        <OverviewDashbarCard
          name={IMPORTANT_RECOMMENDATIONS}
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
          onClickFilterByName={onClickFilterByName}
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
