import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import propTypes from 'prop-types';

import { Grid, GridItem } from '@patternfly/react-core';

import { OverviewDashbarCard } from '../Cards/OverviewDashbarCard';
import { updateRecFilters, filtersInitialState } from '../../Services/Filters';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { workloadQueryBuilder } from '../Common/Tables';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';
import messages from '../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  IMPORTANT_TAG,
  CRITICAL_TAG,
  SEVERITY_MAP,
  RECOMMENDATIONS_TAB,
  PATHWAYS_TAB,
} from '../../AppConstants';

const getWrongTitleErrorMessage = (nameOfComponent) => {
  return `Error! ${nameOfComponent} was provided with an invalid title. Valid titles are: ${
    nameOfComponent === 'applyFiltersByTitle' ? '' : `'${PATHWAYS}', `
  }'${INCIDENTS}', '${IMPORTANT_RECOMMENDATIONS}', '${CRITICAL_RECOMMENDATIONS}'`;
};

/*****************************************/
const OverviewDashbar = ({ changeTab }) => {
  const { offset } = useSelector(({ filters: { pathState } }) => pathState);
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const options = {
    ...(selectedTags?.length > 0 ? { tags: selectedTags.join(',') } : {}),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
  };
  const { data, isLoading, isFetching, isError } = useGetPathwaysQuery({
    sort: '-recommendation_level',
    offset,
    limit: 3,
    ...options,
  });

  // the initial filters state in recommendations table
  const { recState: defaultFilters } = filtersInitialState;
  // This function is used to apply filters to the recommendations table
  // It resets the values to be the default values, and then adds the values that are passed to it in Addedfilters
  const applyFilters = (Addedfilters) => {
    dispatch(updateRecFilters({ ...defaultFilters, ...Addedfilters }));
  };

  // this function is used to apply filters to the recommendations table based on the title of the card that was clicked
  // also, it changes the tab to the recommendations tab (only if the title matches one of the recommendations titles: critical, important, or incidents)
  const applyFiltersByTitle = (title) => {
    let needToChangeTab = true;
    switch (title) {
      case INCIDENTS:
        applyFilters({ incident: true });
        break;
      case CRITICAL_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[CRITICAL_TAG] });
        break;
      case IMPORTANT_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[IMPORTANT_TAG] });
        break;
      default:
        needToChangeTab = false;
        console.log(getWrongTitleErrorMessage('applyFiltersByTitle'));
        break;
    }
    if (needToChangeTab) {
      changeTab(RECOMMENDATIONS_TAB);
    }
  };

  return !isLoading && !isFetching && !isError ? (
    <Grid hasGutter id="overview-dashbar">
      <GridItem span={3}>
        <OverviewDashbarCard
          title={PATHWAYS}
          count={data.data?.length}
          onClickFilterByTitle={() => {
            changeTab(PATHWAYS_TAB);
          }}
          formatMessage={formatMessage}
          getWrongTitleErrorMessage={getWrongTitleErrorMessage}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={INCIDENTS}
          count={data.data?.length} // BLOCKED: Waiting for implementation of the API endpoint to return the "overview" including the correct count (opened an issue for this)
          onClickFilterByTitle={applyFiltersByTitle}
          formatMessage={formatMessage}
          getWrongTitleErrorMessage={getWrongTitleErrorMessage}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={CRITICAL_RECOMMENDATIONS}
          count={data.data?.length} // BLOCKED: Waiting for implementation of the API endpoint to return the "overview" including the correct count (opened an issue for this)
          onClickFilterByTitle={applyFiltersByTitle}
          formatMessage={formatMessage}
          getWrongTitleErrorMessage={getWrongTitleErrorMessage}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={IMPORTANT_RECOMMENDATIONS}
          count={data.data?.length} // BLOCKED: Waiting for implementation of the API endpoint to return the "overview" including the correct count (opened an issue for this)
          onClickFilterByTitle={applyFiltersByTitle}
          formatMessage={formatMessage}
          getWrongTitleErrorMessage={getWrongTitleErrorMessage}
        />
      </GridItem>
    </Grid>
  ) : !isError ? (
    <Loading />
  ) : (
    <MessageState
      icon={'none'}
      title={formatMessage(messages.noPathwaysAvailable)}
      text={formatMessage(messages.pathwaysPanelsError)}
    />
  );
};

OverviewDashbar.propTypes = {
  changeTab: propTypes.func,
};

export default OverviewDashbar;
