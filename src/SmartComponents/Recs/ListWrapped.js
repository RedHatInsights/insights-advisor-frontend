import React, { useContext, useEffect } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import messages from '../../Messages';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';
import {
  Stack,
  StackItem,
  Tooltip,
  Popover,
  TextContent,
  Flex,
  Text,
  TextVariants,
  Icon,
} from '@patternfly/react-core';

import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { EnvironmentContext } from '../../App';
import IopOverviewDashbar from '../../PresentationalComponents/OverviewDashbar/IopOverviewDashbar';

const List = () => {
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
        {!envContext.isLoading && envContext.displayExecReportLink && (
          <Tooltip
            trigger={!envContext.isExportEnabled ? 'mouseenter' : ''}
            content={messages.permsAction.defaultMessage}
          >
            <DownloadExecReport isDisabled={!envContext.isExportEnabled} />
          </Tooltip>
        )}
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

List.displayName = 'recommendations-list';

export default List;
