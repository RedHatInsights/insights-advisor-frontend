import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy } from 'react';

import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

// We really don't need to do this.
// There is so much lazy loading going on, which most likely has no measurable improvment.
// Loading the components lazy in the/a router should be enough and every thing below should not be lazy loaded.
const SystemsTable = lazy(() =>
  import(
    /* webpackChunkName: "SystemsTable" */ '../../PresentationalComponents/SystemsTable/SystemsTable'
  )
);

const List = () => {
  const intl = useIntl();
  // There is now a chrome API to change the title, which should be used.
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
      <Main>
        <Suspense fallback={<Loading />}>
          <SystemsTable />
        </Suspense>
      </Main>
    </React.Fragment>
  );
};

List.displayName = 'systems-list';

export default List;
