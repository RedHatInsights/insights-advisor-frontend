import React from 'react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import {
  Flex,
  Icon,
  Popover,
  Text,
  TextContent,
  Tooltip,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import DownloadExecReport from '../../PresentationalComponents/ExecutiveReport/Download';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import FlagProvider from '@unleash/proxy-client-react';

const mountComponent = (hasEdgeDevices, envContextOverrides = {}) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <EnvironmentContext.Provider value={finalEnvContext}>
        <MemoryRouter initialEntries={['/recommendations']}>
          <AccountStatContext.Provider value={{ hasEdgeDevices }}>
            <IntlProvider locale={navigator.language.slice(0, 2)}>
              <Provider store={initStore()}>
                <Routes>
                  <Route
                    path="recommendations"
                    element={
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
                                      <Text component={'p'}>
                                        The advisor service assesses and
                                        monitors the health of your Red Hat
                                        Enterprise Linux (RHEL) infrastructure,
                                        and provides recommendations to address
                                        availability, stability, performance,
                                        and security issues.
                                      </Text>
                                      <Text component={'p'}>
                                        <a
                                          rel="noreferrer"
                                          target="_blank"
                                          href={
                                            'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/assessing_rhel_configuration_issues_by_using_the_red_hat_lightspeed_advisor_service/index'
                                          }
                                        >
                                          Assessing RHEL Configuration Issues
                                          Using the Red Hat
                                          {envContext.isLightspeedEnabled
                                            ? ' Lightspeed '
                                            : ' Insights '}
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
                        {!finalEnvContext.isLoading &&
                          finalEnvContext.displayExecReportLink && (
                            <Tooltip
                              trigger={
                                !finalEnvContext.isExportEnabled
                                  ? 'mouseenter'
                                  : ''
                              }
                              content={messages.permsAction.defaultMessage}
                            >
                              <DownloadExecReport
                                isDisabled={!finalEnvContext.isExportEnabled}
                              />
                            </Tooltip>
                          )}
                      </PageHeader>
                    }
                  ></Route>
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>
      ,
    </FlagProvider>,
  );
};

describe('Recommendations table header', () => {
  beforeEach(() => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [
          {
            name: 'platform.lightspeed-rebrand',
            enabled: true,
          },
        ],
      },
    }).as('getFeatureFlag');
  });

  it('is rendered with default values', () => {
    mountComponent();
    cy.get('h1[data-ouia-component-type="RHI/Header"]').contains(
      'Recommendations',
    );
    cy.get('button[aria-label="Download Exec Report"]');

    cy.get('h1[data-ouia-component-type="RHI/Header"]').find('svg').click();
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('h6')
      .contains('About advisor recommendations');
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('p')
      .eq(0)
      .contains(
        'The advisor service assesses and monitors the health of your Red Hat Enterprise Linux (RHEL) infrastructure, and provides recommendations to address availability, stability, performance, and security issues.',
      );
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('a')
      .contains(
        'Assessing RHEL Configuration Issues Using the Red Hat Insights Advisor Service',
      );
    cy.get('button[aria-label="Download Exec Report"]').click();
    cy.get('@requestPdfStub').should('have.been.called');
  });

  it('is rendered without exec report link', () => {
    mountComponent(true, {
      displayExecReportLink: false,
    });
    cy.get('h1[data-ouia-component-type="RHI/Header"]').contains(
      'Recommendations',
    );
    cy.get('button[aria-label="Download Exec Report"]').should('not.exist');

    cy.get('h1[data-ouia-component-type="RHI/Header"]').find('svg').click();
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('h6')
      .contains('About advisor recommendations');
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('p')
      .eq(0)
      .contains(
        'The advisor service assesses and monitors the health of your Red Hat Enterprise Linux (RHEL) infrastructure, and provides recommendations to address availability, stability, performance, and security issues.',
      );
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('a')
      .contains(
        'Assessing RHEL Configuration Issues Using the Red Hat Insights Advisor Service',
      );
  });

  it('is rendered without exec report link', () => {
    mountComponent(true, {
      isExportEnabled: false,
    });
    cy.get('h1[data-ouia-component-type="RHI/Header"]').contains(
      'Recommendations',
    );
    cy.get('button[aria-label="Download Exec Report"]').should('exist');

    cy.get('h1[data-ouia-component-type="RHI/Header"]').find('svg').click();
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('h6')
      .contains('About advisor recommendations');
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('p')
      .eq(0)
      .contains(
        'The advisor service assesses and monitors the health of your Red Hat Enterprise Linux (RHEL) infrastructure, and provides recommendations to address availability, stability, performance, and security issues.',
      );
    cy.get('div[class="pf-v5-c-popover__content"]')
      .find('a')
      .contains(
        'Assessing RHEL Configuration Issues Using the Red Hat Insights Advisor Service',
      );
    cy.get('button[aria-disabled="true"]').contains(
      'Download executive report',
    );
  });
});
