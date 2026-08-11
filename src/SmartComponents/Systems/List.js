import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useContext, useEffect } from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import { useAnsibleWorkloadDefault } from '../../Utilities/hooks/useAnsibleWorkloadDefault';

const List = () => {
  const envContext = useContext(EnvironmentContext);
  const { isReady, defaultFilters } = useAnsibleWorkloadDefault();

  useEffect(() => {
    envContext.updateDocumentTitle('Systems - Advisor');
  }, [envContext]);

  if (!isReady) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={`${messages.systems.defaultMessage}`} />
      </PageHeader>
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <SystemsTable defaultFilters={defaultFilters} />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
