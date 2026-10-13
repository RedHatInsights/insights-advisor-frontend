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
const DEFAULT_ROW_COUNT = fixtures.length;

const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (
  props = {},
  envContextOverrides = {},
  systemProfileOverride = systemProfile.data,
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
    cy.intercept(
      `/api/insights/v1/system/${SYSTEM_ID}/reports/**`,
      fixtures,
    ).as('getSystemReports');
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

    it('renders all rows from reports fixture', () => {
      cy.get(`${ROOT} tbody tr:not(.pf-v6-c-table__expandable-row)`).should(
        'have.length',
        DEFAULT_ROW_COUNT,
      );
    });

    it('displays Description as the default filter', () => {
      cy.get('button[aria-label="Conditional filter toggle"]')
        .find('span[class=ins-c-conditional-filter__value-selector]')
        .should('have.text', 'Description');
      cy.get(CONDITIONAL_FILTER).should('exist');
    });

    it('links recommendation description to detail page', () => {
      cy.get(`${ROOT} tbody tr:first [data-label="Description"] a`)
        .should('have.attr', 'href')
        .and('include', `/recommendations/${fixtures[0].rule.rule_id}`);
    });
  });

  describe('row expandability', () => {
    const headerToggle = 'thead th.pf-v6-c-table__toggle button';

    beforeEach(() => {
      mountComponent();
      waitForSystemAdvisor();
    });

    it('shows expand all button in table header', () => {
      cy.get(headerToggle)
        .should('exist')
        .and('have.attr', 'aria-label', 'Expand all rows');
    });

    it('expands all rows via header chevron and displays ReportDetails', () => {
      cy.get(headerToggle).click();
      cy.get(headerToggle).should('have.attr', 'aria-expanded', 'true');
      cy.get('.ins-c-report-details').should('exist');
      cy.get('.pf-v6-c-table__expandable-row').should(
        'have.length',
        DEFAULT_ROW_COUNT,
      );
    });

    it('collapses all rows via header chevron', () => {
      cy.get(headerToggle).click();
      cy.get(headerToggle).should('have.attr', 'aria-expanded', 'true');
      cy.get('.ins-c-report-details').should('exist');

      cy.get(headerToggle).click();
      cy.get(headerToggle).should('have.attr', 'aria-expanded', 'false');
      cy.get('.ins-c-report-details').should('not.exist');
    });

    it('expands a single row and verifies full-width rendering', () => {
      cy.get(`${ROOT} tbody tr:first td.pf-v6-c-table__toggle button`).click();
      cy.get('.ins-c-report-details').should('be.visible');
    });

    it('displays correct KBA link and title in expanded row details', () => {
      const firstRule = fixtures[0].rule;
      const matchingKcs = fixturesKcs.find(
        (article) => String(article.id) === String(firstRule.node_id),
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
        .should('contain', `${DEFAULT_ROW_COUNT} selected`);
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

      mountComponent();
      cy.wait('@getSystemReportsFailed');
      cy.contains('Error getting recommendations').should('exist');
    });
  });
});
