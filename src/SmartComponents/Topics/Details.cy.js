import React from 'react';
import Details from './Details';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import { hasChip, itExportsDataToFile } from '../../../cypress/utils/table';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import messages from '../../../locales/translations.json';
import FlagProvider from '@unleash/proxy-client-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mountComponent = (
  hasEdgeDevices,
  envContextOverrides = {},
  customStore,
) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.mount(
    <QueryClientProvider client={createTestQueryClient()}>
      <FlagProvider
        config={{
          url: 'http://localhost:8002/feature_flags',
          clientKey: 'abc',
          appName: 'abc',
        }}
      >
        <EnvironmentContext.Provider value={finalEnvContext}>
          <MemoryRouter initialEntries={['/topics/123']}>
            <AccountStatContext.Provider value={{ hasEdgeDevices }}>
              <IntlProvider messages={messages} defaultLocale="en" locale="en">
                <Provider store={customStore || initStore()}>
                  <Routes>
                    <Route path="topics/:id" element={<Details />}></Route>
                  </Routes>
                </Provider>
              </IntlProvider>
            </AccountStatContext.Provider>
          </MemoryRouter>
        </EnvironmentContext.Provider>
      </FlagProvider>
    </QueryClientProvider>,
  );
};

const setupDefaultIntercepts = () => {
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: { toggles: [] },
  }).as('getFeatureFlag');

  cy.intercept('GET', '**/api/inventory/v1/groups*', {
    statusCode: 200,
    body: {
      results: [
        { id: 'ws-1', name: 'Production', host_count: 10 },
        { id: 'ws-2', name: 'Staging', host_count: 5 },
      ],
      total: 2,
    },
  }).as('getInventoryGroups');

  cy.intercept('GET', '**/topic/123/**', {
    name: 'Amazon Web Services (AWS)',
    slug: 'aws',
    description:
      'Increase stability of your RHEL workloads running on Amazon Web Services by applying these recommendations.',
    tag: 'aws',
    featured: true,
    enabled: true,
    impacted_systems_count: 0,
  }).as('topic_details_call');

  cy.intercept('GET', '**/rule/?*', {
    data: [],
  }).as('rules_table_call');

  cy.intercept('GET', '**/rule/?*topic=123*', {
    data: [],
  }).as('rules_table_initial_call');
};

describe('Topic Details is loaded correctly for user with Edge systems', () => {
  beforeEach(() => {
    setupDefaultIntercepts();
    mountComponent(true);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Systems impacted', '1 or more Immutable (OSTree)');
  });
});

describe('Topic Details is loaded correctly for user without Edge systems', () => {
  beforeEach(() => {
    setupDefaultIntercepts();
    mountComponent(false);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
  });
});

describe('Export', () => {
  beforeEach(() => {
    setupDefaultIntercepts();
  });

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
    cy.wait('@topic_details_call');
    cy.get('button[aria-label="Export"]', { timeout: 10000 })
      .first()
      .trigger('mouseenter');
    cy.contains('Export data').should('be.visible');
  });

  it(`works and downloads report is enabled`, () => {
    mountComponent(false);
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});

describe('Workspace filter integration', () => {
  it('passes workspace filter to rules API on topic details when selectedGroups is in Redux', () => {
    setupDefaultIntercepts();

    cy.intercept('GET', '**/rule/?*groups=Workspace-A*', {
      data: [],
    }).as('getRulesWithWorkspace');

    const store = initStore();
    store.dispatch({
      type: 'filters/updateGroups',
      payload: ['Workspace-A'],
    });

    mountComponent(false, {}, store);

    cy.wait('@topic_details_call');
    cy.wait('@getRulesWithWorkspace');
  });
});
