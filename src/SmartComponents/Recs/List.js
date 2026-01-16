import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

import { QuestionTooltip } from '../../PresentationalComponents/Common/Common';
import messages from '../../Messages';
import OverviewDashbar from '../../PresentationalComponents/OverviewDashbar/OverviewDashbar';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
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
  Content,
  Flex,
  ContentVariants,
  Icon,
  FlexItem,
} from '@patternfly/react-core';

import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from '../../AppConstants';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import { EnvironmentContext } from '../../App';

const PathwaysTable = lazy(
  () =>
    import(
      /* webpackChunkName: 'PathwaysTable' */ '../../PresentationalComponents/PathwaysTable/PathwaysTable'
    ),
);

const List = () => {
  const { pathname } = useLocation();
  const navigate = useInsightsNavigate();
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext.updateDocumentTitle('Recommendations - Advisor');
  }, [envContext]);

  const [activeTab, setActiveTab] = useState(
    pathname === '/insights/advisor/recommendations/pathways'
      ? PATHWAYS_TAB
      : RECOMMENDATIONS_TAB,
  );
  const changeTab = (tab) => {
    setActiveTab(tab);
    navigate(
      tab === PATHWAYS_TAB ? '/recommendations/pathways' : '/recommendations',
    );
  };

  return (
    <React.Fragment>
      <PageHeader className="adv-c-page-recommendations__header">
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ width: '100%' }}
        >
          <FlexItem>
            <PageHeaderTitle
              title={
                <React.Fragment>
                  {messages.recommendations.defaultMessage}
                  <Popover
                    headerContent="About advisor recommendations"
                    bodyContent={
                      <Content>
                        <Flex direction={{ default: 'column' }}>
                          <Content component={ContentVariants.p}>
                            The advisor service assesses and monitors the health
                            of your Red Hat Enterprise Linux (RHEL)
                            infrastructure, and provides recommendations to
                            address availability, stability, performance, and
                            security issues.
                          </Content>
                          <Content component={ContentVariants.p}>
                            <a
                              rel="noreferrer"
                              target="_blank"
                              href={
                                'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/assessing_rhel_configuration_issues_by_using_the_red_hat_lightspeed_advisor_service/index'
                              }
                            >
                              Assessing RHEL Configuration Issues Using the Red
                              Hat
                              {envContext.isLightspeedEnabled
                                ? ' Lightspeed '
                                : ' Insights '}
                              Advisor Service
                              <Icon className="pf-v6-u-ml-xs">
                                <ExternalLinkAltIcon />
                              </Icon>
                            </a>
                          </Content>
                        </Flex>
                      </Content>
                    }
                  >
                    <Icon>
                      <OutlinedQuestionCircleIcon
                        className="pf-v6-u-ml-sm"
                        color="var(--pf-t--global--icon--color--subtle)"
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
          </FlexItem>
          {!envContext.isLoading && envContext.displayExecReportLink && (
            <FlexItem className="pf-v6-u-mt-xl">
              <Tooltip
                trigger={!envContext.isExportEnabled ? 'mouseenter' : ''}
                content={messages.permsAction.defaultMessage}
              >
                <DownloadExecReport isDisabled={!envContext.isExportEnabled} />
              </Tooltip>
            </FlexItem>
          )}
        </Flex>
      </PageHeader>
      <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
        <Stack hasGutter>
          <StackItem>
            <OverviewDashbar changeTab={changeTab} />
          </StackItem>
          <StackItem>
            {envContext.displayRecPathways ? (
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
            ) : (
              <RulesTable />
            )}
          </StackItem>
        </Stack>
      </section>
    </React.Fragment>
  );
};

List.displayName = 'recommendations-list';

export default List;
