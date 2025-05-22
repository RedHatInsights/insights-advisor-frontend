import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useEffect } from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import EdgeSystemsBanner from './EdgeSystemsBanner';

const List = () => {
  const chrome = useChrome();
  useEffect(() => {
    chrome.updateDocumentTitle('Systems - Advisor');
  }, [chrome]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={`${messages.systems.defaultMessage}`} />
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <EdgeSystemsBanner />
        <SystemsTable />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
