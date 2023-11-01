import React, { useState, useEffect } from 'react';

import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import propTypes from "prop-types";

import { Grid, GridItem } from "@patternfly/react-core";
import { OverviewDashbarCard } from "../Cards/OverviewDashbarCard/OverviewDashbarCard";
import { updateRecFilters, filtersInitialState } from "../../Services/Filters";
import { Get } from '../../Utilities/Api';
import MessageState from "../MessageState/MessageState";
import Loading from "../Loading/Loading";
import messages from "../../Messages";
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
  STATS_OVERVIEW_FETCH_URL,
} from "../../AppConstants";

const OverviewDashbar = ({ changeTab }) => {

  const [numOfPathways, setNumOfPathways] = useState(0);
  const [numOfIncidents, setNumOfIncidents] = useState(0);
  const [numOfCriticalRecommendations, setNumOfCriticalRecommendations] = useState(0);
  const [numOfImportantRecommendations, setNumOfImportantRecommendations] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(true);

  const dispatch = useDispatch();

  const dataFetch = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await Promise.resolve(
        await Get(STATS_OVERVIEW_FETCH_URL),
      );
      return response.data;
    } catch (e) {
      setIsError(true);
      console.log(e, messages.overviewDashbarError);
      return { pathways: -1, incidents: -1, critical: -1, important: -1 };
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(async () => {
    const { pathways, incidents, critical, important } = await dataFetch();

    setNumOfPathways(pathways);
    setNumOfIncidents(incidents);
    setNumOfCriticalRecommendations(critical);
    setNumOfImportantRecommendations(important);
  }, []);

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
    switch (title) {
      case INCIDENTS:
        applyFilters({ incident: true });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      case CRITICAL_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[CRITICAL_TAG] });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      case IMPORTANT_RECOMMENDATIONS:
        applyFilters({ total_risk: SEVERITY_MAP[IMPORTANT_TAG] });
        changeTab(RECOMMENDATIONS_TAB);
        break;
      default:
        console.log(`Error! applyFiltersByTitle was provided with an invalid title. Valid titles are:
          '${PATHWAYS}', '${INCIDENTS}', '${IMPORTANT_RECOMMENDATIONS}' and '${CRITICAL_RECOMMENDATIONS}'`);
        break;
    }
  };

  return !isLoading && !isError ? (
    <Grid hasGutter id="overview-dashbar">
      <GridItem span={3}>
        <OverviewDashbarCard
          title={PATHWAYS}
          count={numOfPathways}
          onClickFilterByTitle={() => {
            changeTab(PATHWAYS_TAB);
          }}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={INCIDENTS}
          count={numOfIncidents}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={CRITICAL_RECOMMENDATIONS}
          count={numOfCriticalRecommendations}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
      <GridItem span={3}>
        <OverviewDashbarCard
          title={IMPORTANT_RECOMMENDATIONS}
          count={numOfImportantRecommendations}
          onClickFilterByTitle={applyFiltersByTitle}
        />
      </GridItem>
    </Grid>
  ) : !isError ? (
    <Loading />
  ) : (
    <MessageState
      icon={"none"}
      title={messages.noOverviewAvailable.defaultMessage}
      text={messages.overviewDashbarError.defaultMessage}
    />
  );
};

OverviewDashbar.propTypes = {
  changeTab: propTypes.func,
};

export default OverviewDashbar;
