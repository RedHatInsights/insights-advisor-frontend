import './ListIop.scss';
import React, { useContext, useEffect } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import messages from '../../Messages';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import {
  Stack,
  StackItem,
  Popover,
  Content,
  Flex,
  Icon,
} from '@patternfly/react-core';

import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { EnvironmentContext } from '../../App';
import IopOverviewDashbar from '../../PresentationalComponents/OverviewDashbar/IopOverviewDashbar';

const ListIop = () => {
  const envContext = useContext(EnvironmentContext);

  useEffect(() => {
    envContext.updateDocumentTitle('Recommendations - Advisor');
  }, [envContext]);

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
                  <Content>
                    <Flex direction={{ default: 'column' }}>
                      <Content component="p">
                        The advisor service assesses and monitors the health of
                        your Red Hat Enterprise Linux (RHEL) infrastructure, and
                        provides recommendations to address availability,
                        stability, performance, and security issues.
                      </Content>
                      <Content component="p">
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
                      </Content>
                    </Flex>
                  </Content>
                }
              >
                <Icon>
                  <OutlinedQuestionCircleIcon
                    className="pf-v5-u-ml-sm"
                    color="var(--pf-t--temp--dev--tbd)"
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
            <IopOverviewDashbar changeTab={0} />
          </StackItem>
          <StackItem>
            <RulesTable />
          </StackItem>
        </Stack>
      </section>
    </React.Fragment>
  );
};

ListIop.displayName = 'recommendations-list';

export default ListIop;
