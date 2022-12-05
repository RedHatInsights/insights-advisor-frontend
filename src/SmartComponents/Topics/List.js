import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import { Section } from '@redhat-cloud-services/frontend-components/Section';
import React from 'react';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import messages from '../../Messages';
import { useGetTopicsQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';

const List = () => {
  const intl = useIntl();
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.topics.defaultMessage,
  });
  let options = selectedTags?.length && { tags: selectedTags };
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

  const {
    data = [],
    isLoading,
    isFetching,
    isError,
  } = useGetTopicsQuery(options);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle
          title={`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.topics)
            .toLowerCase()}`}
        />
      </PageHeader>
      <Section>
        <TopicsTable props={{ data, isLoading, isFetching, isError }} />
      </Section>
    </React.Fragment>
  );
};

List.displayName = 'list-topics';

export default List;
