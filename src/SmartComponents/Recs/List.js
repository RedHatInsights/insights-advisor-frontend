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
import { useHistory, useLocation } from 'react-router-dom';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Section } from '@redhat-cloud-services/frontend-components/Section';
import { PERMS } from '../../AppConstants';
import { QuestionTooltip } from '../../PresentationalComponents/Common/Common';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const RulesTable = lazy(() =>
  import(
    /* webpackChunkName: 'RulesTable' */ '../../PresentationalComponents/RulesTable/RulesTable'
  )
);
const PathwaysTable = lazy(() =>
  import(
    /* webpackChunkName: 'PathwaysTable' */ '../../PresentationalComponents/PathwaysTable/PathwaysTable'
  )
);
const PathwaysPanel = lazy(() =>
  import(
    /* webpackChunkName: 'PathwaysPanel' */ '../../PresentationalComponents/PathwaysPanel/PathwaysPanel'
  )
);

const List = () => {
  const intl = useIntl();
  const { pathname } = useLocation();
  const history = useHistory();
  const permsExport = usePermissions('advisor', PERMS.export);
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.recommendations.defaultMessage,
  });
  const [activeTab, setActiveTab] = useState(
    pathname === '/recommendations/pathways' ? 1 : 0
  );
  const changeTab = (tab) => {
    setActiveTab(tab);
    history.push(tab === 1 ? '/recommendations/pathways' : '/recommendations');
  };

  return (
    <React.Fragment>
      <PageHeader className="adv-c-page-recommendations__header">
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
      <Section>
        <Suspense fallback={<Loading />}>
          <PathwaysPanel />
        </Suspense>
        <Tabs
          className="adv__background--global-100"
          activeKey={activeTab}
          onSelect={(_e, tab) => changeTab(tab)}
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
              <RulesTable isTabActive={activeTab === 0} />
            </Suspense>
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                {intl.formatMessage(messages.pathways)}{' '}
                {QuestionTooltip(
                  intl.formatMessage(messages.recommendedPathways)
                )}
              </TabTitleText>
            }
          >
            <Suspense fallback={<Loading />}>
              <PathwaysTable isTabActive={activeTab === 1} />
            </Suspense>
          </Tab>
        </Tabs>
      </Section>
    </React.Fragment>
  );
};

List.displayName = 'recommendations-list';

export default List;
