import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useEffect } from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

const List = () => {
  const intl = useIntl();
  const chrome = useChrome();
  useEffect(() => {
    chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, {
        subnav: messages.systems.defaultMessage,
      })
    );
  }, [chrome, intl]);

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
