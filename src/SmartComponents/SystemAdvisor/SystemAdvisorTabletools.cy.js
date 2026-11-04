import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlagProvider from '@unleash/proxy-client-react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import _ from 'lodash';

import SystemAdvisor from './SystemAdvisor';
import { initStore } from '../../Store';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import fixturesKcs from '../../../cypress/fixtures/kcs.json';
import systemProfile from '../../../cypress/fixtures/systemProfile.json';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import { featureFlagInterceptor } from '../../../cypress/support/interceptors';
import { hasChip } from '../../../cypress/utils/table';
import {
  waitForTableTools,
  checkTableToolsHeaders,
} from '../../../cypress/utils/tabletools';

import {
  CHIP_GROUP,
  CONDITIONAL_FILTER,
  MENU_ITEM,
  PT_BULK_SELECT,
  PT_BULK_SELECT_CHECKBOX,
  PT_BULK_SELECT_LIST,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

const TABLE_HEADERS = [
  'Description',
  'Modified',
  'First impacted',
  'Total risk',
  'Remediation type',
];
const ROOT = 'table[data-ouia-component-id=system-advisor-table]';
const SYSTEM_ID = '123';
const SYSTEM_INSIGHTS_ID = '456';
const ROWS_PER_PAGE = 20;

const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (
  props = {},
  envContextOverrides = {},
  systemProfileOverride = systemProfile.data,
  reportsFixture = fixtures,
) => {
  featureFlagInterceptor(['advisor-tabletools-migration']);
  cy.intercept('POST', '**/feature_flags/client/metrics', { statusCode: 200 });
  cy.intercept('GET', '**/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [
        {
          name: 'advisor-tabletools-migration',
          enabled: true,
        },
      ],
    },
  }).as('getFeatureFlag');

  cy.intercept(
    `**/hosts/${SYSTEM_ID}/system_profile`,
    systemProfileOverride,
  ).as('getSystemProfile');

  if (reportsFixture !== null) {
    cy.intercept(
      `/api/insights/v1/system/${SYSTEM_ID}/reports/**`,
      reportsFixture,
    ).as('getSystemReports');
  }

  const finalEnvContext = {
    ...createTestEnvironmentContext(),
    ...envContextOverrides,
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  cy.mount(
    <QueryClientProvider client={queryClient}>
      <FlagProvider config={flagProviderConfig}>
        <EnvironmentContext.Provider value={finalEnvContext}>
          <MemoryRouter>
            <IntlProvider
              locale={navigator.language.slice(0, 2)}
              messages={messages}
            >
              <Provider store={initStore()}>
                <Routes>
                  <Route
                    path="*"
                    element={
                      <SystemAdvisor
                        inventoryId={SYSTEM_ID}
                        entity={{
                          id: SYSTEM_ID,
                          insights_id: SYSTEM_INSIGHTS_ID,
                        }}
                        response={{
                          insights_attributes: {
                            uuid: '12345',
                          },
                        }}
                        hostName="testhost"
                        {...props}
                      />
                    }
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

const waitForSystemAdvisor = () => {
  cy.wait(['@getSystemReports', '@getSystemProfile', '@kcs']);
  waitForTableTools(ROOT, false);
};

describe('SystemAdvisor (TableTools Implementation)', () => {
  beforeEach(() => {
    cy.intercept('/api/insights/v1/account_setting/', {
      statusCode: 200,
      body: {},
    });
    cy.intercept('https://access.redhat.com/hydra/rest/search/kcs**', {
      response: {
        docs: fixturesKcs,
      },
    }).as('kcs');
  });

  describe('defaults and rendering', () => {
    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('renders toolbar and table with 5 columns', () => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get(ROOT).should('have.length', 1);
      checkTableToolsHeaders(TABLE_HEADERS, ROOT);
    });

    it('renders all rows on initial page', () => {
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        ROWS_PER_PAGE,
      );
    });

    it('displays Description as the default filter', () => {
      cy.get('button[aria-label="Conditional filter toggle"]')
        .find('span[class=ins-c-conditional-filter__value-selector]')
        .should('have.text', 'Description');
      cy.get(CONDITIONAL_FILTER).should('exist');
    });

    it('links recommendation description to detail page', () => {
      // First row after default Total risk desc sort
      cy.get(`${ROOT} tbody tr:first [data-label="Description"] a`)
        .should('have.attr', 'href')
        .and('include', '/recommendations/');
    });
  });

  describe('row expandability', () => {
    const headerToggle = 'thead th button[aria-label="Expand all rows"]';

    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('shows expand all button in table header', () => {
      cy.get(headerToggle).should('exist');
    });

    it('expands all rows via header chevron and displays ReportDetails', () => {
      cy.get(headerToggle).click();
      cy.get('.ins-c-report-details').should('exist');
      cy.get('.pf-v6-c-table__expandable-row').should(
        'have.length',
        ROWS_PER_PAGE,
      );
    });

    it('expands and collapses a single row showing ReportDetails content', () => {
      cy.get(`${ROOT} tbody tr:first td.pf-v6-c-table__toggle button`).click();
      cy.get('.ins-c-report-details').should('be.visible');

      cy.get(`${ROOT} tbody tr:first td.pf-v6-c-table__toggle button`).click();
      cy.get('.ins-c-report-details').should('not.exist');
    });

    it('displays correct KBA link and title in expanded row details', () => {
      // Find the rule corresponding to the first row (highest total_risk by default sort)
      const sortedByRisk = [...fixtures].sort(
        (a, b) => (b.rule?.total_risk || 0) - (a.rule?.total_risk || 0),
      );
      const topRule = sortedByRisk[0].rule;
      const matchingKcs = fixturesKcs.find(
        (article) => String(article.id) === String(topRule.node_id),
      );

      cy.get(`${ROOT} tbody tr:first td.pf-v6-c-table__toggle button`).click();
      cy.get('.ins-c-report-details__kba a')
        .should('include.text', matchingKcs.publishedTitle)
        .should('have.attr', 'href')
        .and('include', `access.stage.redhat.com/articles/${matchingKcs.id}`);
    });
  });

  describe('bulk selection and remediation', () => {
    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('shows bulk select control in toolbar', () => {
      cy.get(PT_BULK_SELECT_CHECKBOX).should('exist');
    });

    it('disables remediation button when no items selected', () => {
      cy.contains('button', 'Plan remediation').should('be.disabled');
    });

    it('selects all rows and enables remediation button', () => {
      cy.get(PT_BULK_SELECT).click();
      cy.get(PT_BULK_SELECT_LIST).contains('Select all').click();
      cy.get(PT_BULK_SELECT_CHECKBOX)
        .parent()
        .should('contain', `${fixtures.length} selected`);
      cy.contains('button', 'Plan remediation').should('not.be.disabled');
    });

    it('deselects all rows via Select none', () => {
      cy.get(PT_BULK_SELECT).click();
      cy.get(PT_BULK_SELECT_LIST).contains('Select all').click();
      cy.contains('button', 'Plan remediation').should('not.be.disabled');

      cy.get(PT_BULK_SELECT).click();
      cy.get(PT_BULK_SELECT_LIST).contains('Select none').click();
      cy.contains('button', 'Plan remediation').should('be.disabled');
    });

    it('hides remediation button when host is of type edge', () => {
      const edgeProfile = _.cloneDeep(systemProfile.data);
      edgeProfile.results[0].system_profile.host_type = 'edge';

      mountComponent({}, {}, edgeProfile);
      waitForSystemAdvisor();
      cy.contains('button', 'Plan remediation').should('not.exist');
    });
  });

  describe('conditional filters', () => {
    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('filters by Description text search and resets', () => {
      cy.get('[aria-label="text input"]').click();
      cy.get('[aria-label="text input"]').type('hendrerit{enter}');

      hasChip('Description', 'hendrerit');
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length.at.least',
        1,
      );

      cy.get('button').contains('Clear filters').click();
      cy.get(CHIP_GROUP).should('have.length', 0);
    });

    it('filters by Total risk', () => {
      cy.get('button[aria-label="Conditional filter toggle"]').click();
      cy.get(MENU_ITEM).contains('Total risk').click();

      cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
      cy.get(MENU_ITEM).contains('Low').click();
      cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

      hasChip('Total risk', 'Low');
      cy.get('button').contains('Clear filters').click();
      cy.get(CHIP_GROUP).should('have.length', 0);
    });

    it('filters by Category', () => {
      cy.get('button[aria-label="Conditional filter toggle"]').click();
      cy.get(MENU_ITEM).contains('Category').click();

      cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
      cy.get(MENU_ITEM).contains('Security').click();
      cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();

      hasChip('Category', 'Security');
      cy.get('button').contains('Clear filters').click();
      cy.get(CHIP_GROUP).should('have.length', 0);
    });

    it('filters by Remediation', () => {
      cy.get('button[aria-label="Conditional filter toggle"]').click();
      cy.get(MENU_ITEM).contains('Remediation').click();

      cy.get(CONDITIONAL_FILTER).contains('Filter by remediation').click();
      cy.get(MENU_ITEM).contains('Ansible playbook').click();
      cy.get(CONDITIONAL_FILTER).contains('Filter by remediation').click();

      hasChip('Remediation', 'Ansible playbook');
      cy.get('button').contains('Clear filters').click();
      cy.get(CHIP_GROUP).should('have.length', 0);
    });
  });

  describe('sorting and pagination', () => {
    it('sorts rows when clicking Description column header', () => {
      mountComponent();
      waitForSystemAdvisor();

      cy.get(`${ROOT} th[data-label="Description"] button`).click();
      waitForTableTools(ROOT, false);
      cy.tableIsSortedBy('Description', 'ascending');

      cy.get(`${ROOT} th[data-label="Description"] button`).click();
      waitForTableTools(ROOT, false);
      cy.tableIsSortedBy('Description', 'descending');
    });

    it('sorts rows when clicking Total risk column header', () => {
      mountComponent();
      waitForSystemAdvisor();

      cy.tableIsSortedBy('Total risk', 'descending');

      cy.get(`${ROOT} th[data-label="Total risk"] button`).click();
      waitForTableTools(ROOT, false);
      cy.tableIsSortedBy('Total risk', 'ascending');

      cy.get(`${ROOT} th[data-label="Total risk"] button`).click();
      waitForTableTools(ROOT, false);
      cy.tableIsSortedBy('Total risk', 'descending');
    });

    it('paginates across pages and updates rows', () => {
      mountComponent();
      waitForSystemAdvisor();

      // Verify page 1 shows 20 items by default
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        ROWS_PER_PAGE,
      );

      // Navigate to next page
      cy.get('button[data-action="next"]').first().click();
      waitForTableTools(ROOT, false);

      // Page 2 should have remaining 5 items
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        fixtures.length - ROWS_PER_PAGE,
      );

      // Navigate back to previous page
      cy.get('button[data-action="previous"]').first().click();
      waitForTableTools(ROOT, false);

      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        ROWS_PER_PAGE,
      );
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('shows "No matching recommendations found" with Cubes icon when filter criteria matches nothing', () => {
      cy.get('[aria-label="text input"]').click();
      cy.get('[aria-label="text input"]').type(
        'NonExistentRecommendationQuery123{enter}',
      );

      cy.contains('No matching recommendations found').should('be.visible');
      cy.contains(
        'To continue, edit your filter settings and search again.',
      ).should('be.visible');
    });
  });

  describe('export capability', () => {
    it('renders export dropdown when isExportEnabled is true', () => {
      mountComponent({}, { isExportEnabled: true });
      waitForSystemAdvisor();
      cy.get('button[aria-label="Export"]').should('exist');
    });

    it('hides export dropdown when isExportEnabled is false', () => {
      mountComponent({}, { isExportEnabled: false });
      waitForSystemAdvisor();
      cy.get('button[aria-label="Export"]').should('not.exist');
    });
  });

  describe('connection and error states', () => {
    it('renders NotConnected when insights_id is null', () => {
      mountComponent({
        entity: {
          id: SYSTEM_ID,
          insights_id: null,
        },
      });
      cy.contains('This system isn’t connected to Insights').should('exist');
    });

    it('renders fetch failed empty state on API error', () => {
      cy.intercept(`/api/insights/v1/system/${SYSTEM_ID}/reports/**`, {
        statusCode: 500,
        body: {},
      }).as('getSystemReportsFailed');

      mountComponent({}, {}, systemProfile.data, null);
      cy.wait('@getSystemReportsFailed');
      cy.contains('Error getting recommendations').should('exist');
    });
  });
});
