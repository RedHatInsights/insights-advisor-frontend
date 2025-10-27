import './_Details.scss';

import React, { useContext, useEffect } from 'react';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/esm/components/Content/Content';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { Label } from '@patternfly/react-core/dist/esm/components/Label/Label';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';

import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import { Truncate } from '@redhat-cloud-services/frontend-components/Truncate';
import messages from '../../Messages';
import { updateRecFilters } from '../../Services/Filters';
import { useDispatch } from 'react-redux';
import { useGetTopicQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { getDefaultImpactingFilter } from '../../PresentationalComponents/RulesTable/helpers';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';

const Details = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const recFilters = useSelector(({ filters }) => filters.recState);
  const topicId = useParams().id;
  let options = selectedTags?.length && { tags: selectedTags };
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
  const hasEdgeDevices = useContext(AccountStatContext);

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
        topic: topicId,
        ...getDefaultImpactingFilter(hasEdgeDevices),
        rule_status: 'enabled',
        sort: `-total_risk`,
        limit: 10,
        offset: 0,
      }),
    );

    return () => dispatch(updateRecFilters(initiaRecFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
