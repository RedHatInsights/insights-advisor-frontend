import './_Details.scss';

import React, { useEffect } from 'react';
import {
  Text,
  TextVariants,
} from '@patternfly/react-core/dist/js/components/Text/Text';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import StarIcon from '@patternfly/react-icons/dist/js/icons/star-icon';
import { TextContent } from '@patternfly/react-core/dist/js/components/Text/TextContent';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { Truncate } from '@redhat-cloud-services/frontend-components/Truncate';
import messages from '../../Messages';
import { updateRecFilters } from '../../Services/Filters';
import { useDispatch } from 'react-redux';
import { useGetTopicQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

const Details = () => {
  const chrome = useChrome();
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

  useEffect(() => {
    if (topic && topic.name) {
      const subnav = `${topic.name} - ${messages.topics.defaultMessage}`;
      chrome.updateDocumentTitle(
        intl.formatMessage(messages.documentTitle, { subnav })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  return (
    <React.Fragment>
      <PageHeader>
        {topic?.name && <Breadcrumbs current={topic?.name} ouiaId="details" />}
        {!isFetching && (
          <React.Fragment>
            <Title headingLevel="h3" size="2xl" className="pf-u-mb-lg">
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
            <TextContent className="pf-u-mt-md">
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
      <Main>
        <React.Fragment>
          {!isError ? (
            <React.Fragment>
              <Title headingLevel="h3" size="2xl" className="pf-u-mb-lg">
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
      </Main>
    </React.Fragment>
  );
};

export default Details;
