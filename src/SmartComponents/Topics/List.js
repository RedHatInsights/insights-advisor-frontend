import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import React, { useEffect } from 'react';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import messages from '../../Messages';
import { useGetTopicsQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

const List = () => {
  const intl = useIntl();
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const chrome = useChrome();

  useEffect(() => {
    chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, {
        subnav: messages.topics.defaultMessage,
      })
    );
  }, [chrome, intl]);

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
        <PageHeaderTitle title={`${messages.topics.defaultMessage}`} />
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <TopicsTable props={{ data, isLoading, isFetching, isError }} />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'list-topics';

export default List;
