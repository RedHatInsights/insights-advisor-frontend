import './_Details.scss';

import React, { useContext, useEffect, useState } from 'react';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/esm/components/Content/Content';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable.new';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';

import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import { Truncate } from '@redhat-cloud-services/frontend-components/Truncate';
import messages from '../../Messages';
import { useFetchTopic } from '../../Services/apiClient';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { EnvironmentContext } from '../../App';

const Details = () => {
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const topicId = useParams().id;
  let options = selectedTags?.length && { tags: selectedTags };
  workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
  const fetchTopic = useFetchTopic();

  const [topic, setTopic] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadTopic = async () => {
      setIsFetching(true);
      try {
        const data = await fetchTopic(topicId, options);
        setTopic(data);
        setIsError(false);
      } catch (error) {
        setIsError(error);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };
    loadTopic();
  }, [fetchTopic, topicId, JSON.stringify(options)]);

  useEffect(() => {
    if (topic && topic.name) {
      envContext.updateDocumentTitle(`${topic.name} - Topics - Advisor`);
    }
  }, [envContext, topic]);

  return (
    <React.Fragment>
      <PageHeader>
        {topic?.name && <Breadcrumbs current={topic?.name} ouiaId="details" />}
        {!isFetching && (
          <React.Fragment>
            <Title headingLevel="h3" size="2xl" className="pf-v6-u-mb-lg">
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
            <Content className="pf-v6-u-mt-md">
              <Content component={ContentVariants.p}>
                <Truncate
                  text={topic.description}
                  length={600}
                  expandText={intl.formatMessage(messages.readmore)}
                  collapseText={intl.formatMessage(messages.readless)}
                  inline
                />
              </Content>
            </Content>
          </React.Fragment>
        )}
        {isFetching || (isLoading && <Loading />)}
      </PageHeader>
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <React.Fragment>
          {!isError ? (
            <React.Fragment>
              <Title headingLevel="h3" size="2xl" className="pf-v6-u-mb-lg">
                {intl.formatMessage(messages.recommendations)}
              </Title>
              <RulesTable isTabActive={true} topic={topicId} />
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
