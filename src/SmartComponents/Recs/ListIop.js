import './ListIop.scss';
import React, { lazy, Suspense, useContext, useEffect, useState } from 'react';
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
} from '@patternfly/react-core';

import {
  ExternalLinkAltIcon,
  LockIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { EnvironmentContext } from '../../App';
import IopOverviewDashbar from '../../PresentationalComponents/OverviewDashbar/IopOverviewDashbar';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import Loading from '../../PresentationalComponents/Loading/Loading';

const PathwaysTable = lazy(
  () =>
    import(
      /* webpackChunkName: 'PathwaysTable' */ '../../PresentationalComponents/PathwaysTable/PathwaysTable'
    ),
);

const ListIop = () => {
  const envContext = useContext(EnvironmentContext);
  const [activeTab, setActiveTab] = useState(0);
  const changeTab = (tab) => setActiveTab(tab);

  useEffect(() => {
    envContext.updateDocumentTitle('Recommendations - Advisor');
  }, [envContext]);

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
            {envContext.displayRecPathways ? (
              <Tabs
                className="adv__background--global-100"
                activeKey={activeTab}
                onSelect={(_e, tab) => changeTab(tab)}
              >
                <Tab
                  eventKey={0}
                  title={<TabTitleText>Recommendations</TabTitleText>}
                >
                  <RulesTable onRuleChange={handleRuleChange} />
                </Tab>
                <Tab
                  eventKey={1}
                  title={<TabTitleText>Pathways</TabTitleText>}
                >
                  {activeTab === 1 && (
                    <Suspense fallback={<Loading />}>
                      <PathwaysTable isTabActive={activeTab === 1} />
                    </Suspense>
                  )}
                </Tab>
              </Tabs>
            ) : (
              <RulesTable onRuleChange={handleRuleChange} />
            )}
          </StackItem>
        </Stack>
      </section>
    </React.Fragment>
  );
};

ListIop.displayName = 'recommendations-list';

export default ListIop;
