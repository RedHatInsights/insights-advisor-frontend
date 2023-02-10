import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const List = () => {
  const intl = useIntl();

  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.systems.defaultMessage,
  });

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle
          title={`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.systems)
            .toLowerCase()}`}
        />
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <SystemsTable />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
