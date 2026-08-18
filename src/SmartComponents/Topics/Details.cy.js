import React from 'react';
import Details from './Details';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';
import { FlagProvider } from '@unleash/proxy-client-react';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import { itExportsDataToFile } from '../../../cypress/utils/table';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import messages from '../../../locales/translations.json';

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

  cy.intercept('POST', '/feature_flags/client/metrics', { statusCode: 200 });

  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: { toggles: [] },
  }).as('getFeatureFlags');

  cy.intercept('GET', `${currentRequestBasePath}/topic/123/`, {
    name: 'Amazon Web Services (AWS)',
    slug: 'aws',
    description:
      'Increase stability of your RHEL workloads running on Amazon Web Services by applying these recommendations.',
    tag: 'aws',
    featured: true,
    enabled: true,
    impacted_systems_count: 0,
  }).as('topic_details_call');

  // Intercept rules table requests with fixture data
  cy.intercept('GET', `${currentRequestBasePath}/rule/*`, fixtures).as(
    'rules_table_call',
  );

  cy.mount(
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
              <Provider store={initStore()}>
                <Routes>
                  <Route path="topics/:id" element={<Details />}></Route>
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>
    </FlagProvider>,
  );
};

describe('Topic Details is loaded correctly for user with Edge systems', () => {
  beforeEach(() => {
    mountComponent(true);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait('@rules_table_call').then((interception) => {
      // Verify the API request includes topic filter
      expect(interception.request.url).to.include('topic=123');
    });

    // Verify default filter chips appear in UI (PatternFly v6 uses label-group)
    cy.get('.pf-v6-c-label-group').should('exist');
    cy.contains('.pf-v6-c-label-group__label', 'Status').should('exist');
    cy.contains('.pf-v6-c-label__text', 'Enabled').should('exist');
  });
});

describe('Topic Details is loaded correctly for user without Edge systems', () => {
  beforeEach(() => {
    mountComponent(false);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait('@rules_table_call').then((interception) => {
      // Verify the API request includes topic filter
      expect(interception.request.url).to.include('topic=123');
    });

    // Verify default filter chips appear in UI (PatternFly v6 uses label-group)
    cy.get('.pf-v6-c-label-group').should('exist');
    cy.contains('.pf-v6-c-label-group__label', 'Status').should('exist');
    cy.contains('.pf-v6-c-label__text', 'Enabled').should('exist');
  });
});

describe('Export', () => {
  it(`download button not rendered if export not enabled`, () => {
    mountComponent(true, {
      isExportEnabled: false,
    });
    cy.get('button[aria-label="Export"]').should('not.exist');
  });

  it.skip(`download button tooltip displays the correct content if enabled`, () => {
    // TODO: RulesTable.new.js doesn't have export functionality yet
    mountComponent(true, {
      isExportEnabled: true,
    });
    cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
    cy.contains('Export data').should('be.visible');
  });

  it(`works and downloads report is enabled`, () => {
    mountComponent(false);
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});
