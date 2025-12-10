/**
 * @fileoverview Main recommendations list page component for IoP environment.
 * Displays the overview dashboard and recommendations table with IoP-specific
 * header and documentation links.
 */

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
import IopOverviewDashbar from '../IopOverviewDashbar';

/**
 * Recommendations list page component for IoP environment.
 * Displays a page header with an about popover, overview dashboard showing
 * key metrics, and the recommendations table. The header includes a link to
 * Red Hat Lightspeed or Insights Advisor documentation based on feature flags.
 *
 * @component
 * @returns {React.ReactElement} Page with header, overview dashboard, and recommendations table
 *
 * @example
 * // Used as a route component in IoP environment
 * <Route path="/recommendations" component={ListIop} />
 */
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
