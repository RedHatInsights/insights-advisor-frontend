import './List.scss';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy } from 'react';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { PERMS } from '../../AppConstants';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const RulesTable = lazy(() =>
  import(
    /* webpackChunkName: "RulesTable" */ '../../PresentationalComponents/RulesTable/RulesTable'
  )
);

const List = () => {
  const intl = useIntl();
  const permsExport = usePermissions('advisor', PERMS.export);
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.recommendations.defaultMessage,
  });

  return (
    <React.Fragment>
      <PageHeader className="ins-c-recommendations-header">
        <PageHeaderTitle
          title={`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.recommendations)
            .toLowerCase()}`}
        />
        {!permsExport.isLoading && (
          <Tooltip
            trigger={!permsExport.hasAccess ? 'mouseenter' : ''}
            content={intl.formatMessage(messages.permsAction)}
          >
            <DownloadExecReport isDisabled={!permsExport.hasAccess} />
          </Tooltip>
        )}
      </PageHeader>
      <Main>
        <Suspense fallback={<Loading />}>
          <RulesTable />
        </Suspense>
      </Main>
    </React.Fragment>
  );
};

List.displayName = 'recommendations-list';

export default List;
