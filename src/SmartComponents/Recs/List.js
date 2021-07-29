import './List.scss';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useState } from 'react';
import {
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core/dist/esm/components/Tabs/index';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/esm/components/Tooltip/';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { PERMS } from '../../AppConstants';
import { global_info_color_100 } from '@patternfly/react-tokens';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const RulesTable = lazy(() =>
  import(
    /* webpackChunkName: 'RulesTable' */ '../../PresentationalComponents/RulesTable/RulesTable'
  )
);
const PathwaysPanel = lazy(() =>
  import(
    /* webpackChunkName: 'PathwaysPanel' */ '../../PresentationalComponents/PathwaysPanel/PathwaysPanel'
  )
);

const List = () => {
  const intl = useIntl();
  const permsExport = usePermissions('advisor', PERMS.export);
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.recommendations.defaultMessage,
  });
  const [activeTab, setActiveTab] = useState(0);

  const questionTooltip = (text) => (
    <Tooltip
      key={text}
      position={TooltipPosition.right}
      content={<div>{text}</div>}
    >
      <span aria-label="Action">
        <OutlinedQuestionCircleIcon color={global_info_color_100.value} />
      </span>
    </Tooltip>
  );

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
          <PathwaysPanel />
        </Suspense>
        <Tabs
          className="ins-c-tab-header"
          mountOnEnter
          unmountOnExit
          activeKey={activeTab}
          onSelect={(_e, tab) => setActiveTab(tab)}
        >
          <Tab
            eventKey={0}
            title={
              <TabTitleText>
                {intl.formatMessage(messages.recommendations)}
              </TabTitleText>
            }
          >
            <Suspense fallback={<Loading />}>
              <RulesTable />
            </Suspense>
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                {intl.formatMessage(messages.pathways)}{' '}
                {questionTooltip(
                  intl.formatMessage(messages.recommendedPathways)
                )}
              </TabTitleText>
            }
          >
            {intl.formatMessage(messages.pathways)}
          </Tab>
        </Tabs>
      </Main>
    </React.Fragment>
  );
};

List.displayName = 'recommendations-list';

export default List;
