import './_PathwaysPanel.scss';

import {
  Card,
  CardExpandableContent,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core/dist/esm/components/Card/index';
import { Grid, GridItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../MessageState/MessageState';
import { PathwayCard } from '../Cards/PathwayCard';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import messages from '../../Messages';
import propTypes from 'prop-types';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

const PathwaysPanel = () => {
  const intl = useIntl();
  const { offset } = useSelector(({ filters: { pathState } }) => pathState);
  const [expanded, setExpanded] = useState(
    JSON.parse(localStorage.getItem('advisor_pathwayspanel_expanded') || 'true')
  );
  const { data, isLoading, isFetching, isError } = useGetPathwaysQuery({
    sort: '-recommendation_level',
    offset,
    limit: 3,
  });

  return !isLoading ? (
    <Card
      className="adv-c-card adv-c-card-pathways-panel"
      id="adv-c-card-pathwayspanel"
      isExpanded={expanded}
    >
      <CardHeader
        onExpand={() => {
          setExpanded(!expanded);
          localStorage.setItem('advisor_pathwayspanel_expanded', !expanded);
        }}
        toggleButtonProps={{
          id: `ins-c-advisor__card-title--pathwayspanel-toggle-button`,
          'aria-label': 'Details',
          'aria-labelledby': `ins-c-advisor__card-title--pathwayspanel toggle-button`,
        }}
      >
        <CardTitle>
          <Title headingLevel="h2" size="lg">
            {intl.formatMessage(messages.improveRecommended)}
          </Title>
        </CardTitle>
      </CardHeader>
      <CardExpandableContent>
        {isFetching ? (
          <Loading />
        ) : !isError && data.data?.length ? (
          <Grid
            md={data.data?.length === 1 ? 8 : data.data?.length === 2 ? 6 : 4}
            sm={12}
          >
            {data.data.map((pathway) => (
              <GridItem key={pathway.name}>
                <PathwayCard {...pathway} />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <MessageState
            icon={'none'}
            text={intl.formatMessage(messages.noPathways)}
          />
        )}
      </CardExpandableContent>
    </Card>
  ) : (
    <Loading />
  );
};

PathwaysPanel.propTypes = {
  className: propTypes.string,
};

export default PathwaysPanel;
