import './ListIop.scss';
import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import messages from '../../Messages';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import { useOverviewRefetchOnRuleChange } from '../../Utilities/Hooks';
import {
  Stack,
  StackItem,
  Popover,
  TextContent,
  Flex,
  Text,
  TextVariants,
  Icon,
  Tab,
  TabTitleText,
  Tabs,
  Spinner,
  Bullseye,
} from '@patternfly/react-core';

import {
  ExternalLinkAltIcon,
  LockIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { EnvironmentContext } from '../../App';
import IopOverviewDashbar from '../../PresentationalComponents/OverviewDashbar/IopOverviewDashbar';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { QuestionTooltip } from '../../PresentationalComponents/Common/Common';
import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from '../../AppConstants';

const PathwaysTable = lazy(
  () =>
    import(
      /* webpackChunkName: 'PathwaysTable' */ '../../PresentationalComponents/PathwaysTable/PathwaysTable'
    ),
);

const ListIop = () => {
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext.updateDocumentTitle('Recommendations - Advisor');
  }, [envContext]);

  const [activeTab, setActiveTab] = useState(RECOMMENDATIONS_TAB);
  const changeTab = (tab) => setActiveTab(tab);

  const { handleOverviewRefetchReady, handleRuleChange } =
    useOverviewRefetchOnRuleChange();

  return !envContext.isAllowedToViewRec ? (
    <MessageState
      variant="large"
      icon={LockIcon}
      title={messages.permsTitle.defaultMessage}
      text={messages.permsBody.defaultMessage}
    />
  ) : (
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
                            'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/assessing_rhel_configuration_issues_by_using_the_red_hat_lightspeed_advisor_service/index'
                          }
                        >
                          Assessing RHEL Configuration Issues Using the Red Hat
                          {envContext.isLightspeedEnabled
                            ? 'Lightspeed'
                            : 'Insights'}
                          Advisor Service
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
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <Stack hasGutter>
          <StackItem>
            <IopOverviewDashbar
              changeTab={changeTab}
              onRefetchReady={handleOverviewRefetchReady}
            />
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
                <RulesTable
                  isTabActive={activeTab === RECOMMENDATIONS_TAB}
                  onRuleChange={handleRuleChange}
                />
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

ListIop.displayName = 'recommendations-list';

export default ListIop;
