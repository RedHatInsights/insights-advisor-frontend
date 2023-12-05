import React from 'react';
import propTypes from 'prop-types';

import useApplyFilters from './Hooks/useApplyFilters/useApplyFilters';
import useOverviewData from './Hooks/useOverviewData/useOverviewData';
import { Grid, GridItem } from '@patternfly/react-core';
import { OverviewDashbarCard } from '../Cards/OverviewDashbarCard/OverviewDashbarCard';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';
import messages from '../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
  PATHWAYS_TAB,
} from '../../AppConstants';

const OverviewDashbar = ({ changeTab }) => {
  const { data } = useOverviewData();
  const { pathways, incidents, critical, important, loaded, isError } = data;

  const { applyFiltersByTitle } = useApplyFilters(changeTab);

  return loaded && !isError ? (
    <Grid hasGutter id="overview-dashbar">
      <GridItem span={3}>
        <OverviewDashbarCard
          title={PATHWAYS}
          count={pathways}
          onClickFilterByTitle={() => {
            changeTab(PATHWAYS_TAB);
          }}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={INCIDENTS}
          count={incidents}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={CRITICAL_RECOMMENDATIONS}
          count={critical}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={IMPORTANT_RECOMMENDATIONS}
          count={important}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
    </Grid>
  ) : !isError ? (
    <Loading />
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
