import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetailsPathways from './DetailsPathways';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import _ from 'lodash';
import {
  createTestEnvironmentContext,
  rulesTableColumnsNew,
} from '../../../cypress/support/globals';
import {
  featureFlagInterceptor,
  rulesTableApiInterceptor,
} from '../../../cypress/support/interceptors';
import FlagProvider from '@unleash/proxy-client-react';
import {
  hasChip,
  itExportsDataToFile,
  removeAllFilterChipsPf6,
} from '../../../cypress/utils/table';

import {
  checkRowCounts,
  CONDITIONAL_FILTER,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (envContextOverrides = {}, pathwayOverrides = {}) => {
  featureFlagInterceptor(['advisor-tabletools-migration']);
  cy.intercept('POST', '**/feature_flags/client/metrics', { statusCode: 200 });

  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.intercept('GET', /\/api\/insights\/v1\/pathway\/test-pathway.*/, {
    statusCode: 200,
    body: {
      slug: 'test-pathway',
      name: 'Test Pathway',
      description: 'Pathway description for testing.',
      component: 'kernel',
      resolution_risk: {
        name: 'Test Pathway',
        risk: 3,
      },
      publish_date: '2022-08-04T10:25:57.294000Z',
      has_playbook: true,
      impacted_systems_count: 3,
      reboot_required: false,
      has_incident: false,
      categories: [
        {
          id: 1,
          name: 'Availability',
        },
      ],
      recommendation_level: 2,
      incident_count: 0,
      critical_risk_count: 0,
      high_risk_count: 1,
      medium_risk_count: 2,
      low_risk_count: 0,
      ...pathwayOverrides,
    },
  }).as('pathway_details_call');

  cy.intercept('GET', /\/api\/insights\/v1\/system.*/, {
    statusCode: 200,
    body: {
      meta: { count: 3 },
      data: [],
    },
  }).as('systems_check_call');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  cy.mount(
    <QueryClientProvider client={queryClient}>
      <FlagProvider config={flagProviderConfig}>
        <EnvironmentContext.Provider value={finalEnvContext}>
          <MemoryRouter
            initialEntries={['/recommendations/pathways/test-pathway']}
          >
            <IntlProvider
              locale={navigator.language.slice(0, 2)}
              messages={messages}
            >
              <Provider store={initStore()}>
                <Routes>
                  <Route
                    path="recommendations/pathways/:id"
                    element={<DetailsPathways />}
                  />
                </Routes>
              </Provider>
            </IntlProvider>
          </MemoryRouter>
        </EnvironmentContext.Provider>
      </FlagProvider>
    </QueryClientProvider>,
  );
};

const ROOT = 'table[data-ouia-component-id=rules-table]';
const TABLE_HEADERS = _.map(rulesTableColumnsNew, (it) => it.title);
const DEFAULT_ROW_COUNT = 20;

const checkDataHeaders = (expectedHeaders) => {
  cy.get(`${ROOT} th[scope="col"]`)
    .then(($els) =>
      _.map(Cypress.$.makeArray($els), 'innerText')
        .map((text) => text.trim())
        .filter(Boolean),
    )
    .should('deep.equal', expectedHeaders);
};

const waitForTable = () => {
  cy.get('[aria-label="Loading"]', { timeout: 10000 }).should('not.exist');
  cy.get(ROOT).should('exist');
};

const expandAll = () => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
};

const collapseAll = () => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
};

describe('Pathway Details (TableTools Implementation)', () => {
  describe('defaults and rendering', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('renders pathway title and table with 6 columns', () => {
      cy.get('.pf-v6-c-page__main-section, section').should(
        'contain',
        'Test Pathway',
      );
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get(ROOT).should('have.length', 1);
      checkDataHeaders(TABLE_HEADERS);
    });

    it(`pagination defaults to ${DEFAULT_ROW_COUNT} rows`, () => {
      cy.get('.pf-v6-c-menu-toggle__text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        DEFAULT_ROW_COUNT,
      );
    });

    it('defaults to sorting by Total risk descending', () => {
      cy.tableIsSortedBy('Total risk', 'descending');
    });

    it('applies default filters (Status: Enabled, Systems impacted: 1 or more)', () => {
      hasChip('Status', 'Enabled');
      hasChip('Systems impacted', '1 or more');
    });

    it('displays Name as the default conditional filter', () => {
      cy.get('button[aria-label="Conditional filter toggle"]')
        .find('span[class=ins-c-conditional-filter__value-selector]')
        .should('have.text', 'Name');
      cy.get(CONDITIONAL_FILTER).should('exist');
    });

    it('displays Reset filters button when filters deviate from default', () => {
      removeAllFilterChipsPf6();
      waitForTable();
      cy.get('button').contains('Reset filters').should('exist');
      cy.get('button').contains('Reset filters').click();
      waitForTable();
      hasChip('Status', 'Enabled');
      hasChip('Systems impacted', '1 or more');
      cy.get('button').contains('Reset filters').should('not.exist');
    });
  });

  describe('row expandability', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('shows expand all button in table header', () => {
      cy.get('thead th button[aria-label="Expand all rows"]').should('exist');
    });

    it('expands all rows via header chevron', () => {
      expandAll();
      cy.get('thead th button[aria-label="Expand all rows"]').should(
        'have.attr',
        'aria-expanded',
        'true',
      );
      checkRowCounts(DEFAULT_ROW_COUNT * 2);
    });

    it('collapses all rows via header chevron', () => {
      expandAll();
      cy.get('thead th button[aria-label="Expand all rows"]').should(
        'have.attr',
        'aria-expanded',
        'true',
      );
      collapseAll();
      cy.get('thead th button[aria-label="Expand all rows"]').should(
        'have.attr',
        'aria-expanded',
        'false',
      );
      checkRowCounts(DEFAULT_ROW_COUNT);
    });
  });

  describe('export capability', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('exports data to CSV', () => {
      itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    });
  });
});
