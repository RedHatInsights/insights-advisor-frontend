import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { PERMS } from '../../AppConstants';
import { QuestionTooltip } from '../../PresentationalComponents/Common/Common';
import messages from '../../Messages';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import OverviewDashbar from '../../PresentationalComponents/OverviewDashbar/OverviewDashbar';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import {
  Tab,
  TabTitleText,
  Tabs,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';

import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from '../../AppConstants';

const PathwaysTable = lazy(() =>
  import(
    /* webpackChunkName: 'PathwaysTable' */ '../../PresentationalComponents/PathwaysTable/PathwaysTable'
  )
);

const List = () => {
  const { pathname } = useLocation();
  const navigate = useInsightsNavigate();
  const permsExport = usePermissions('advisor', PERMS.export);
  const chrome = useChrome();

  useEffect(() => {
    chrome.updateDocumentTitle('Recommendations - Advisor');
  }, [chrome]);

  const [activeTab, setActiveTab] = useState(
    pathname === '/insights/advisor/recommendations/pathways'
      ? PATHWAYS_TAB
      : RECOMMENDATIONS_TAB
  );
  const changeTab = (tab) => {
    setActiveTab(tab);
    navigate(
      tab === PATHWAYS_TAB ? '/recommendations/pathways' : '/recommendations'
    );
  };

  return (
    <React.Fragment>
      <PageHeader className="adv-c-page-recommendations__header">
        <PageHeaderTitle title={`${messages.recommendations.defaultMessage}`} />
        {!permsExport.isLoading && (
          <Tooltip
            trigger={!permsExport.hasAccess ? 'mouseenter' : ''}
            content={messages.permsAction.defaultMessage}
          >
            <DownloadExecReport isDisabled={!permsExport.hasAccess} />
          </Tooltip>
        )}
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <Stack hasGutter>
          <StackItem>
            <OverviewDashbar changeTab={changeTab} />
          </StackItem>
          <StackItem>
            <Tabs
              className="adv__background--global-100"
              activeKey={activeTab}
              onSelect={(_e, tab) => changeTab(tab)}
            >
              <Tab
                eventKey={RECOMMENDATIONS_TAB}
                title={
                  <TabTitleText>
                    {messages.recommendations.defaultMessage}
                  </TabTitleText>
                }
              >
                <RulesTable isTabActive={activeTab === RECOMMENDATIONS_TAB} />
              </Tab>
              <Tab
                eventKey={PATHWAYS_TAB}
                title={
                  <TabTitleText>
                    {messages.pathways.defaultMessage}{' '}
                    <QuestionTooltip
                      text={messages.recommendedPathways.defaultMessage}
                    />
                  </TabTitleText>
                }
              >
                {activeTab === PATHWAYS_TAB && (
                  <Suspense fallback={<Loading />}>
                    <PathwaysTable isTabActive={activeTab === PATHWAYS_TAB} />
                  </Suspense>
                )}
              </Tab>
            </Tabs>
          </StackItem>
        </Stack>
      </section>
    </React.Fragment>
  );
};

List.displayName = 'recommendations-list';

export default List;
