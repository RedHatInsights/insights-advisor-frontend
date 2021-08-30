import './_PathwaysPanel.scss';

import {
  Card,
  CardBody,
  CardExpandableContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core/dist/esm/components/Card/index';
import { Grid, GridItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import CategoryLabel from '../CategoryLabel/CategoryLabel';
import { Link } from 'react-router-dom';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../MessageState/MessageState';
import { RebootRequired } from '../Common/Common';
import RuleLabels from '../RuleLabels/RuleLabels';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import messages from '../../Messages';
import propTypes from 'prop-types';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';

const PathwaysPanel = () => {
  const intl = useIntl();
  const [expanded, setExpanded] = useState(
    JSON.parse(localStorage.getItem('advisor_pathwayspanel_expanded') || 'true')
  );

  const { data, isUninitialized, isLoading, isFetching, isSuccess, isError } =
    useGetPathwaysQuery();

  console.error(
    data,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    isError
  );

  const pathwayCard = (pathway) => (
    <Card isFlat isPlain className={`ins-c-advisor__card--pathwaycard`}>
      <CardBody className={`body`}>
        <CategoryLabel key={pathway.name} labelList={pathway.categories} />{' '}
        <Link to={`${pathway.name}`}>
          {intl.formatMessage(messages.topicCardSystemsaffected, {
            systems: pathway.impacted_systems_count,
          })}
        </Link>
      </CardBody>
      <CardBody className={`body`}>{pathway.description}</CardBody>
      <CardBody className={`body`}>
        <RuleLabels rule={pathway.has_incident ? { tags: ['incident'] } : {}} />{' '}
        {RebootRequired(pathway.reboot_required)}
      </CardBody>
      <CardFooter className={`footer`}>
        <Link to={`${pathway.name}`}>
          {`${intl.formatMessage(messages.viewPathway)} `}
          <ArrowRightIcon />
        </Link>
      </CardFooter>
    </Card>
  );

  return !isLoading ? (
    <Card
      className={`ins-c-advisor_card ins-c-advisor__card--pathwayspanel`}
      id={`ins-c-advisor__card--pathwayspanel`}
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
        ) : data.length ? (
          <Grid hasGutter md={4} sm={12}>
            {data.map((pathway) => (
              <GridItem key={pathway.name}>{pathwayCard(pathway)}</GridItem>
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
