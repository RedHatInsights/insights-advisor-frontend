import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
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
  Spinner,
  Bullseye,
  Popover,
  TextContent,
  Flex,
  Text,
  TextVariants,
  Icon,
} from '@patternfly/react-core';

import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from '../../AppConstants';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

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
        <PageHeaderTitle
          title={
            <React.Fragment>
              {messages.recommendations.defaultMessage}
              <Popover
                headerContent="About advisor recommendations"
                bodyContent={
                  <TextContent>
                    <Flex direction={{ default: 'column' }}>
                      <Text component={TextVariants.p}>
                        The advisor service assesses and monitors the health of
                        your Red Hat Enterprise Linux (RHEL) infrastructure, and
                        provides recommendations to address availability,
                        stability, performance, and security issues.
                      </Text>
                      <Text component={TextVariants.p}>
                        <a
                          rel="noreferrer"
                          target="_blank"
                          href={
                            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/' +
                            'assessing_rhel_configuration_issues_using_the_red_hat_insights_advisor_service'
                          }
                        >
                          Assessing RHEL Configuration Issues Using the Red Hat
                          Insights Advisor Service
                          <Icon className="pf-v5-u-ml-xs">
                            <ExternalLinkAltIcon />
                          </Icon>
                        </a>
                      </Text>
                    </Flex>
                  </TextContent>
                }
              >
                <Icon>
                  <OutlinedQuestionCircleIcon
                    className="pf-v5-u-ml-sm"
                    color="var(--pf-v5-global--secondary-color--100)"
                    style={{
                      verticalAlign: 0,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  />
                </Icon>
              </Popover>
            </React.Fragment>
          }
        />
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
                    {messages.pathways.defaultMessage}
                    <QuestionTooltip
                      text={messages.recommendedPathways.defaultMessage}
                    />
                  </TabTitleText>
                }
              >
                {activeTab === PATHWAYS_TAB && (
                  <Suspense
                    fallback={
                      <Bullseye>
                        <Spinner size="xl" />
                      </Bullseye>
                    }
                  >
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
