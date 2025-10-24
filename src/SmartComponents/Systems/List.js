import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useContext, useEffect } from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';

const List = () => {
  const envContext = useContext(EnvironmentContext);
  useEffect(() => {
    envContext.updateDocumentTitle('Systems - Advisor');
  }, [envContext]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={`${messages.systems.defaultMessage}`} />
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <SystemsTable />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
