import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Details from './Details';
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
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (envContextOverrides = {}, topicOverrides = {}) => {
  featureFlagInterceptor(['advisor-tabletools-migration']);
  cy.intercept('POST', '**/feature_flags/client/metrics', { statusCode: 200 });

  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.intercept('GET', /\/api\/insights\/v1\/topic\/123.*/, {
    statusCode: 200,
    body: {
      name: 'Amazon Web Services (AWS)',
      slug: '123',
      description:
        'Increase stability of your RHEL workloads running on Amazon Web Services by applying these recommendations.',
      tag: 'aws',
      featured: true,
      enabled: true,
      impacted_systems_count: 5,
      ...topicOverrides,
    },
  }).as('topic_details_call');

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
          <MemoryRouter initialEntries={['/topics/123']}>
            <AccountStatContext.Provider value={{ hasEdgeDevices: false }}>
              <IntlProvider
                locale={navigator.language.slice(0, 2)}
                messages={messages}
              >
                <Provider store={initStore()}>
                  <Routes>
                    <Route path="topics/:id" element={<Details />} />
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

describe('Topic Details (TableTools Implementation)', () => {
  describe('defaults and rendering', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('renders topic header and table with 6 columns', () => {
      cy.get('.pf-v6-c-page-header, header, section').should(
        'contain',
        'Amazon Web Services (AWS)',
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
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        DEFAULT_ROW_COUNT,
      );
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
