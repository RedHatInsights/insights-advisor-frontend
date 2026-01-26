import React from 'react';
import Details from './Details';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import { itExportsDataToFile } from '../../../cypress/utils/table';
import { hasChip } from '@redhat-cloud-services/frontend-components-utilities';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlagProvider from '@unleash/proxy-client-react';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';

const DEFAULT_API_BASE_PATH = '/api/insights/v1';

/**
 * Mounts the Details component with a configurable environment context AND sets up intercepts dynamically.
 *
 * @param {boolean} hasEdgeDevices - Whether the user has Edge devices.
 * @param {object} envContextOverrides - Optional overrides for the default EnvironmentContext values.
 *
 */
const mountComponent = (hasEdgeDevices, envContextOverrides = {}) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  const currentRequestBasePath =
    finalEnvContext.customBasePath || DEFAULT_API_BASE_PATH;

  cy.intercept(`${currentRequestBasePath}/topic/123/?&topicId=123`, {
    name: 'Amazon Web Services (AWS)',
    slug: 'aws',
    description:
      'Increase stability of your RHEL workloads running on Amazon Web Services by applying these recommendations.',
    tag: 'aws',
    featured: true,
    enabled: true,
    impacted_systems_count: 0,
  }).as('topic_details_call');

  // Intercept for rules table call (general)
  cy.intercept(
    `${currentRequestBasePath}/rule/?impacting=true&rule_status=enabled&sort=-total_risk&limit=20&offset=0`,
    {
      data: [],
    },
  ).as('rules_table_call');

  // Intercept for rules table initial call (specific filters)
  cy.intercept(
    `${currentRequestBasePath}/rule/?topic=123&update_method=ostree%2Cdnfyum&impacting=true&rule_status=enabled&sort=-total_risk&limit=10&offset=0`,
    {
      data: [],
    },
  ).as('rules_table_initial_call');

  // Intercept Kessel workspaces API call
  cy.intercept('/api/rbac/v2/workspaces/?limit=1000&type=default', {
    statusCode: 200,
    body: {
      data: [],
    },
  }).as('workspaces_call');

  // Intercept feature flags endpoint
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [],
    },
  }).as('getFeatureFlag');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  cy.mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AccessCheck.Provider
          baseUrl={window.location.origin}
          apiPath="/api/inventory/v1beta2"
        >
          <EnvironmentContext.Provider value={finalEnvContext}>
            <MemoryRouter initialEntries={['/topics/123']}>
              <AccountStatContext.Provider value={{ hasEdgeDevices }}>
                <IntlProvider locale={navigator.language.slice(0, 2)}>
                  <Provider store={initStore()}>
                    <Routes>
                      <Route path="topics/:id" element={<Details />}></Route>
                    </Routes>
                  </Provider>
                </IntlProvider>
              </AccountStatContext.Provider>
            </MemoryRouter>
          </EnvironmentContext.Provider>
        </AccessCheck.Provider>
      </QueryClientProvider>
    </FlagProvider>,
  );
};

describe('Topic Details is loaded correctly for user with Edge systems', () => {
  beforeEach(() => {
    mountComponent(true);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']); // This should now pass if the URL string is exact
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Systems impacted', '1 or more Immutable (OSTree)');
  });
});

describe('Topic Details is loaded correctly for user without Edge systems', () => {
  beforeEach(() => {
    mountComponent(false);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
  });
});

describe('Export', () => {
  it(`download button not rendered if export not enabled`, () => {
    mountComponent(true, {
      isExportEnabled: false,
    });
    cy.get('button[aria-label="Export"]').should('not.exist');
  });

  it(`download button tooltip displays the correct content if enabled`, () => {
    mountComponent(true, {
      isExportEnabled: true,
    });
    cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
    cy.contains(messages.exportData.defaultMessage).should('be.visible');
  });

  it(`works and downloads report is enabled`, () => {
    mountComponent(false);
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});
