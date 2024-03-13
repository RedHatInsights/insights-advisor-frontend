import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  TextVariants,
  Title,
  TextContent,
  Label,
} from '@patternfly/react-core';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import { StarIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { Truncate } from '@redhat-cloud-services/frontend-components/Truncate';
import messages from '../../Messages';
import { updateRecFilters } from '../../Services/Filters';
import { useGetTopicQuery } from '../../Services/Topics';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import './_Details.scss';

const Details = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const recFilters = useSelector(({ filters }) => filters.recState);
  const topicId = useParams().id;
  let options = selectedTags?.length && { tags: selectedTags };
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

  const {
    data: topic = {},
    isLoading,
    isFetching,
    isError,
  } = useGetTopicQuery({ ...options, ...{ topicId } });

  useEffect(() => {
    const initiaRecFilters = { ...recFilters };
    dispatch(
      updateRecFilters({
        impacting: true,
        rule_status: 'enabled',
        topic: topicId,
        sort: `-total_risk`,
        limit: 10,
        offset: 0,
      })
    );

    return () => dispatch(updateRecFilters(initiaRecFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chrome = useChrome();

  useEffect(() => {
    if (topic && topic.name) {
      const subnav = `${topic.name} - ${messages.topics.defaultMessage}`;
      chrome.updateDocumentTitle(
        intl.formatMessage(messages.documentTitle, { subnav })
      );
    }
  }, [chrome, intl, topic]);

  return (
    <React.Fragment>
      <PageHeader>
        {topic?.name && <Breadcrumbs current={topic?.name} ouiaId="details" />}
        {!isFetching && (
          <React.Fragment>
            <Title headingLevel="h3" size="2xl" className="pf-v5-u-mb-lg">
              {topic.name}
              {topic.featured && (
                <Label
                  color="blue"
                  className="adv-c-label pf-m-compact"
                  icon={<StarIcon />}
                >
                  {intl.formatMessage(messages.featured)}
                </Label>
              )}
            </Title>
            <TextContent className="pf-v5-u-mt-md">
              <Text component={TextVariants.p}>
                <Truncate
                  text={topic.description}
                  length={600}
                  expandText={intl.formatMessage(messages.readmore)}
                  collapseText={intl.formatMessage(messages.readless)}
                  inline
                />
              </Text>
            </TextContent>
          </React.Fragment>
        )}
        {isFetching || (isLoading && <Loading />)}
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <React.Fragment>
          {!isError ? (
            <React.Fragment>
              <Title headingLevel="h3" size="2xl" className="pf-v5-u-mb-lg">
                {intl.formatMessage(messages.recommendations)}
              </Title>
              <RulesTable />
            </React.Fragment>
          ) : (
            <MessageState
              icon={TimesCircleIcon}
              title={intl.formatMessage(messages.topicDetailslNodetailsTitle)}
              text={intl.formatMessage(messages.topicDetailslNodetailsBody)}
            />
          )}
        </React.Fragment>
      </section>
    </React.Fragment>
  );
};

export default Details;
