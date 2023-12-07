import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useEffect } from 'react';
import SystemsTable from '../../PresentationalComponents/SystemsTable/SystemsTable';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import EdgeSystemsBanner from './EdgeSystemsBanner';
import { useFeatureFlag } from '../../Utilities/Hooks';

const List = () => {
  const intl = useIntl();
  const chrome = useChrome();
  const edgeParityFFlag = useFeatureFlag('advisor.edge_parity');
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
        <PageHeaderTitle title={`${messages.systems.defaultMessage}`} />
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        {edgeParityFFlag ? <EdgeSystemsBanner /> : null}
        <SystemsTable />
      </section>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
