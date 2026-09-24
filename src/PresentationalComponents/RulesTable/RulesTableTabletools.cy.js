import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RulesTableNew from './RulesTable.new';
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
  selectConditionalFilterOption,
} from '../../../cypress/utils/table';

import {
  checkPaginationTotal,
  checkRowCounts,
  checkTableHeaders,
  CONDITIONAL_FILTER,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { cypressApplyFilters } from '../../../cypress/utils/table';
import { filtersConf } from '../../../cypress/rulestablesconsts';
import { EnvironmentContext } from '../../App';

const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (props = {}, envContextOverrides = {}) => {
  const hasEdgeDevices = props.hasEdgeDevices || false;

  featureFlagInterceptor(['advisor-tabletools-migration']);
  cy.intercept('POST', '**/feature_flags/client/metrics', { statusCode: 200 });

  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.intercept('GET', '**/feature_flags*', {
    statusCode: 200,
    body: { toggles: [] },
  }).as('getFeatureFlag');

  cy.mount(
    <FlagProvider config={flagProviderConfig}>
      <EnvironmentContext.Provider value={finalEnvContext}>
        <MemoryRouter>
          <AccountStatContext.Provider value={{ hasEdgeDevices }}>
            <IntlProvider
              locale={navigator.language.slice(0, 2)}
              messages={messages}
            >
              <Provider store={initStore()}>
                <Routes>
                  <Route
                    key={'Recommendations'}
                    path="*"
                    element={<RulesTableNew isTabActive={true} />}
                  />
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>
    </FlagProvider>,
  );
};

const expandAll = () => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
};

const collapseAll = () => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
};

const waitForTable = () => {
  cy.get('[aria-label="Loading"]', { timeout: 10000 }).should('not.exist');
  cy.get(ROOT).should('exist');
};

const filtersConfNew = {
  ...filtersConf,
  status: {
    selectorText: 'Status',
    values: [['Enabled'], ['Disabled'], ['Red Hat Disabled']],
    type: 'checkbox',
    filterFunc: (it, value) => it.disabled === value.includes('Disabled'),
    urlParam: 'rule_status',
    urlValue: (it) =>
      Array.isArray(it) ? it[0].toLowerCase() : it.toLowerCase(),
  },
};

const filterApply = (filters) => cypressApplyFilters(filters, filtersConfNew);

const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(rulesTableColumnsNew, (it) => it.title);
const ROOT = 'table[data-ouia-component-id=rules-table]';
const CRITICAL_TOOLTIP_CONTENT =
  'The total risk of this remediation is critical, based on the combination of likelihood and impact to remediate.';
const IMPORTANT_TOOLTIP_CONTENT =
  'The total risk of this remediation is important, based on the combination of likelihood and impact to remediate.';

describe('RulesTable (TableTools Implementation)', () => {
  describe('defaults and rendering', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('renders toolbar and table with 6 data columns', () => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get(ROOT).should('have.length', 1);
      checkTableHeaders(TABLE_HEADERS);
    });

    it(`pagination defaults to ${DEFAULT_ROW_COUNT} rows`, () => {
      cy.get('.pf-v6-c-menu-toggle__text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
      checkRowCounts(DEFAULT_ROW_COUNT);
    });

    it('defaults to sorting by Total risk descending', () => {
      cy.tableIsSortedBy('Total risk', 'descending');
    });

    it('applies default filters (Status: Enabled, Systems impacted: 1 or more)', () => {
      hasChip('Status', 'Enabled');
      hasChip('Systems impacted', '1 or more');
      cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('exist');
    });

    it('displays Name as the default conditional filter', () => {
      cy.get('button[aria-label="Conditional filter toggle"]')
        .find('span[class=ins-c-conditional-filter__value-selector]')
        .should('have.text', 'Name');
      cy.get(CONDITIONAL_FILTER).should('exist');
    });

    it('displays Reset filters button when filters deviate from default', () => {
      selectConditionalFilterOption('Name');
      cy.get('[aria-label="text input"]').click();
      cy.get('[aria-label="text input"]').type('test{enter}');
      hasChip('Name', 'test');
      cy.get('button').contains('Reset filters').should('exist');
      cy.get('button').contains('Reset filters').click();
      waitForTable();
      cy.get('button').contains('Reset filters').should('not.exist');
    });
  });

  describe('links and row navigation', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('links recommendation name and systems count to detail page', () => {
      cy.get('tbody tr:first [data-label="Name"] a')
        .should('have.attr', 'href')
        .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
      cy.get('tbody tr:first [data-label="Systems"] a')
        .should('have.attr', 'href')
        .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
    });
  });

  describe('expand and collapse', () => {
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
      checkRowCounts(DEFAULT_ROW_COUNT * 2);
      cy.get('thead th button[aria-label="Expand all rows"]').should(
        'have.attr',
        'aria-expanded',
        'true',
      );
    });

    it('collapses all rows via header chevron', () => {
      expandAll();
      checkRowCounts(DEFAULT_ROW_COUNT * 2);
      collapseAll();
      checkRowCounts(DEFAULT_ROW_COUNT);
      cy.get('thead th button[aria-label="Expand all rows"]').should(
        'have.attr',
        'aria-expanded',
        'false',
      );
    });

    it('expands and collapses a single row showing RuleDetails content', () => {
      cy.get('tbody [data-ouia-component-type="PF6/TableRow"]')
        .eq(0)
        .find('button[aria-label*="Details"]')
        .click();
      checkRowCounts(DEFAULT_ROW_COUNT + 1);

      // Verify expanded details content
      cy.get('tbody tr[class*="__expandable-row"]')
        .first()
        .within(() => {
          cy.contains('Knowledgebase article').should('exist');
        });

      // Collapse row back
      cy.get('tbody [data-ouia-component-type="PF6/TableRow"]')
        .eq(0)
        .find('button[aria-label*="Details"]')
        .click();
      checkRowCounts(DEFAULT_ROW_COUNT);
    });
  });

  describe('filtering and API queries', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('clearing chips and clicking Reset filters restores default filters', () => {
      removeAllFilterChipsPf6();
      checkRowCounts(DEFAULT_ROW_COUNT);
      checkPaginationTotal(fixtures.meta.count);

      cy.get('button').contains('Reset filters').click();
      waitForTable();
      hasChip('Systems impacted', '1 or more');
      hasChip('Status', 'Enabled');
      cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should(
        'have.length',
        Object.keys(DEFAULT_FILTERS).length,
      );
    });

    Object.entries(filtersConfNew).forEach(([key, config]) => {
      const { urlParam, values, urlValue, selectorText } = config;

      it(`applies ${selectorText} filter and issues API request with ${urlParam}`, () => {
        removeAllFilterChipsPf6();
        waitForTable();

        const testValue = values[0];

        cy.intercept(
          'GET',
          `**/api/insights/v1/rule/*${urlParam}=${urlValue(testValue)}*`,
        ).as('filteredRequest');
        filterApply({ [key]: testValue });
        cy.wait('@filteredRequest')
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(testValue)}`);
      });
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('sorts by Name ascending and descending', () => {
      cy.get('th').contains('Name').click();
      waitForTable();
      cy.tableIsSortedBy('Name', 'ascending');

      cy.get('th').contains('Name').click();
      waitForTable();
      cy.tableIsSortedBy('Name', 'descending');
    });

    it('sorts by Systems count', () => {
      cy.get('th').contains('Systems').click();
      waitForTable();
      cy.tableIsSortedBy('Systems', 'ascending');
    });

    it('resets sort direction to ascending when clicking another column', () => {
      cy.get('th').contains('Total risk').click();
      waitForTable();
      cy.tableIsSortedBy('Total risk', 'ascending');

      cy.get('th').contains('Name').click();
      waitForTable();
      cy.tableIsSortedBy('Name', 'ascending');
      cy.get('th')
        .contains('Total risk')
        .closest('th')
        .should('not.have.attr', 'aria-sort');
    });
  });

  describe('tooltips', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      mountComponent();
      waitForTable();
    });

    it('shows Incident tooltip on hover', () => {
      cy.get('.adv-c-label-incident').first().trigger('mouseenter');
      cy.contains(
        'Indicates configurations that are currently affecting your systems',
      ).should('be.visible');
    });

    it('shows Critical total risk tooltip on hover', () => {
      cy.get('td[data-label="Total risk"] .pf-m-red')
        .first()
        .trigger('mouseenter');
      cy.contains(CRITICAL_TOOLTIP_CONTENT).should('be.visible');
    });

    it('shows Important total risk tooltip on hover', () => {
      cy.get('td[data-label="Total risk"] .pf-m-orange')
        .first()
        .trigger('mouseenter');
      cy.contains(IMPORTANT_TOOLTIP_CONTENT).should('be.visible');
    });
  });

  describe('row actions and modals', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      cy.intercept('GET', /\/api\/insights\/v1\/rule.*impacting=true.*/).as(
        'getDefaultRules',
      );
      cy.intercept('POST', '**/api/insights/v1/ack/', {
        statusCode: 200,
        body: {},
      }).as('disableRule');
    });

    it('opens disable modal, inputs justification, submits, and triggers API', () => {
      mountComponent({}, { isDisableRecEnabled: true });
      cy.wait('@getDefaultRules');
      waitForTable();

      cy.clickOnRowKebab(
        'Reboot fails when there is no "kernelopts" option in the grubenv',
      );
      cy.contains('Disable recommendation').should('be.visible').click();

      // Verify modal is open with explanation text
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains(
        'This recommendation will not be shown in reports and dashboards.',
      ).should('be.visible');

      // Type justification note
      cy.get('#disable-rule-justification').type('Testing disable rule');

      // Click save button
      cy.get('button[data-ouia-component-id="confirm"]').click();

      // Verify API request was made with correct payload
      cy.wait('@disableRule').its('request.body').should('deep.include', {
        rule_id: 'empty_grubenv|EMPTY_GRUBENV_KERNELOPTS',
        justification: 'Testing disable rule',
      });

      // Modal should be closed
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('opens disable modal and cancels without submitting', () => {
      mountComponent({}, { isDisableRecEnabled: true });
      cy.wait('@getDefaultRules');
      waitForTable();

      cy.clickOnRowKebab(
        'Reboot fails when there is no "kernelopts" option in the grubenv',
      );
      cy.contains('Disable recommendation').should('be.visible').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('button[data-ouia-component-id="cancel"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('hides kebab menu when isDisableRecEnabled is false', () => {
      mountComponent({}, { isDisableRecEnabled: false });
      cy.wait('@getDefaultRules');
      waitForTable();

      cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
    });
  });

  describe('export controls and permissions', () => {
    beforeEach(() => {
      rulesTableApiInterceptor(fixtures);
      cy.intercept('GET', /\/api\/insights\/v1\/rule.*impacting=true.*/).as(
        'getDefaultRules',
      );
    });

    it('renders export button and downloads report when isExportEnabled is true', () => {
      mountComponent({}, { isExportEnabled: true });
      cy.wait('@getDefaultRules');
      waitForTable();

      itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    });

    it('hides export button when isExportEnabled is false', () => {
      mountComponent({}, { isExportEnabled: false });
      cy.wait('@getDefaultRules');
      waitForTable();

      cy.get('button[aria-label="Export"]').should('not.exist');
    });
  });
});
