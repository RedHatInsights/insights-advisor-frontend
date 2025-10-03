import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import React, { useContext, useEffect } from 'react';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import messages from '../../Messages';
import { useGetTopicsQuery } from '../../Services/Topics';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { EnvironmentContext } from '../../App';

const List = () => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext.updateDocumentTitle('Topics - Advisor');
  }, [envContext]);

  let options = selectedTags?.length && { tags: selectedTags };
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
  options = { ...options, customBasePath: envContext.BASE_URL };
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
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <TopicsTable props={{ data, isLoading, isFetching, isError }} />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'list-topics';

export default List;
