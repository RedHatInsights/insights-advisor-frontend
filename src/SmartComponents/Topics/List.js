import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import React, { useContext, useEffect, useMemo } from 'react';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import messages from '../../Messages';
import useTopicsQuery from '../../Services/hooks/useTopicsQuery';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';
import { EnvironmentContext } from '../../App';

const List = () => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext.updateDocumentTitle('Topics - Advisor');
  }, [envContext]);

  const params = useMemo(() => {
    let options = {};
    if (selectedTags?.length) {
      options.tags = selectedTags.join(',');
    }
    if (workloads) {
      options = { ...options, ...workloadQueryBuilder(workloads) };
    }
    return options;
  }, [selectedTags, workloads]);

  const { data, loading, error } = useTopicsQuery({ params });

  const topics = data?.data || [];
  const isLoading = loading;
  const isFetching = loading;
  const isError = !!error;

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={`${messages.topics.defaultMessage}`} />
      </PageHeader>
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <TopicsTable props={{ data: topics, isLoading, isFetching, isError }} />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'list-topics';

export default List;
