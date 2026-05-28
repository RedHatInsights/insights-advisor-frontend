import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/newrulestablerecommendations.json';
import _ from 'lodash';
import {
  createTestEnvironmentContext,
  rulesTableColumnsNew,
} from '../../../cypress/support/globals';
import {
  featureFlagInterceptor,
  rulesTableApiInterceptor,
} from '../../../cypress/support/interceptors';
import FlagProvider, { useFlagsStatus } from '@unleash/proxy-client-react';
import {
  hasChip,
  removeAllFilterChipsPf6,
  selectConditionalFilterOption,
} from '../../../cypress/utils/table';

import {
  checkPaginationTotal,
  checkTableHeaders,
  CONDITIONAL_FILTER,
  MENU_ITEM,
  PAGINATION_VALUES,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';

/**
 * NEW RULESTABLE TESTS - Testing tabletools implementation
 * Feature flag: advisor-tabletools-migration = TRUE
 *
 * These tests verify the new bastilian-tabletools implementation.
 * URL parameter tests are skipped because tabletools doesn't support that yet.
 */

// Wrapper to wait for flags before rendering RulesTable
const RulesTableWithFlags = (props) => {
  const { flagsReady } = useFlagsStatus();

  if (!flagsReady) {
    return <div>Loading flags...</div>;
  }

  return <RulesTable {...props} />;
};

const mountComponent = (
  { hasEdgeDevices = false } = {},
  envContextOverrides = {},
) => {
  // Always enable tabletools for these tests
  featureFlagInterceptor(['advisor-tabletools-migration']);
  cy.intercept('POST', '/feature_flags/client/metrics', { statusCode: 200 });

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
                    element={<RulesTableWithFlags />}
                  />
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>
    </FlagProvider>,
  );

  // Wait for feature flags to load
  cy.wait('@getFeatureFlags');
};

const DEFAULT_ROW_COUNT = 20;
const TABLE_HEADERS = _.map(rulesTableColumnsNew, (it) => it.title);
const ROOT = 'table[data-ouia-component-id=rules-table]';
const CRITICAL_TOOLTIP_CONTENT =
  'The total risk of this remediation is critical, based on the combination of likelihood and impact to remediate.';
const IMPORTANT_TOOLTIP_CONTENT =
  'The total risk of this remediation is important, based on the combination of likelihood and impact to remediate.';

describe('New RulesTable (TableTools) - test data', () => {
  it('the first recommendation has systems impacted', () => {
    expect(fixtures.data[0].impacted_systems_count).be.gt(0);
  });
});

describe('New RulesTable (TableTools) - renders correctly', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it('The Rules table renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });

  it('renders toolbar', () => {
    cy.get(TOOLBAR).should('have.length', 1);
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });
});

describe('New RulesTable (TableTools) - defaults', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-v6-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
  });

  it('sorting using Total risk', () => {
    const column = 'Total risk';
    cy.tableIsSortedBy(column);
  });
});

describe('New RulesTable (TableTools) - pagination', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it('shows correct total number of rules', () => {
    checkPaginationTotal(fixtures.meta.count);
  });

  it('values are expected ones', () => {
    // Click top pagination menu (not bottom)
    cy.get('[data-ouia-component-type="PF6/Pagination"]:not(.pf-m-bottom)')
      .find('.pf-v6-c-menu-toggle')
      .click({ force: true });

    // Verify all 4 pagination options exist
    cy.get('[data-action="per-page-10"]').should('exist');
    cy.get('[data-action="per-page-20"]').should('exist');
    cy.get('[data-action="per-page-50"]').should('exist');
    cy.get('[data-action="per-page-100"]').should('exist');

    // Verify text content matches expected values
    cy.get('.pf-v6-c-menu__item-text').each(($el, index) => {
      cy.wrap($el).should('have.text', `${PAGINATION_VALUES[index]} per page`);
    });
  });

  it('can change page limit', () => {
    // Click top pagination menu (not bottom)
    cy.get('[data-ouia-component-type="PF6/Pagination"]:not(.pf-m-bottom)')
      .find('.pf-v6-c-menu-toggle')
      .click({ force: true });

    // Click 50 per page option
    cy.get('[data-action="per-page-50"]').click();

    // Verify pagination text updated to show 50
    cy.get('.pf-v6-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 50');

    // Verify table shows 50 rows
    cy.get(ROOT).find('tbody tr').should('have.length', 50);
  });
});

describe('New RulesTable (TableTools) - filtering', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it('can clear filters', () => {
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('input')
      .type('foobar{enter}');
    removeAllFilterChipsPf6();
  });

  it('can clear filters using Clear filters button', () => {
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('input')
      .type('foobar{enter}');

    // Verify chip exists
    hasChip('Name', 'foobar');

    // Click "Clear filters" button
    cy.get('[data-ouia-component-id="ClearFilters"]').click();

    // Verify chip is removed
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('not.exist');
  });

  it('removing filters shows all recommendations', () => {
    // Apply a filter
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('input')
      .type('HTTP{enter}');

    // Verify chip exists
    hasChip('Name', 'HTTP');

    // Click "Clear filters" button
    cy.get('[data-ouia-component-id="ClearFilters"]').click();

    // Verify table shows all recommendations (mock returns all 50 items)
    cy.get(ROOT).should('exist');
    cy.get(ROOT).find('tbody tr').should('have.length', 50);
  });

  it('will reset filters but not pagination and sorting', () => {
    // Change pagination FIRST (before any filters)
    cy.get('[class*="pf-v6-c-pagination"]')
      .find('button[class*="toggle"]')
      .first()
      .click();
    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('50').click();
    cy.wait('@call');

    // Change sort SECOND (before any filters) - use same pattern as sorting tests
    cy.contains('th button', 'Name').click();
    cy.wait('@call');

    // Verify sort changed to Name ascending
    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    // Apply name filter LAST
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('input')
      .type('HTTP{enter}');
    cy.wait('@call');

    // Verify chip exists
    hasChip('Name', 'HTTP');

    // Clear filters
    cy.get('[data-ouia-component-id="ClearFilters"]').click();
    cy.wait('@call');

    // Check pagination is still 50
    cy.get('.pf-v6-c-menu-toggle__text')
      .find('b')
      .eq(1)
      .should('contain', '50');

    // Check sort is still on Name (ascending)
    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });
});

describe('New RulesTable (TableTools) - individual filters', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it('can filter by Name (text filter)', () => {
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('input')
      .type('grub{enter}');
    hasChip('Name', 'grub');
    // Verify table has data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Total Risk', () => {
    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    hasChip('Total risk', 'Critical');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Risk of Change', () => {
    selectConditionalFilterOption('Risk of change');
    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();
    cy.get(MENU_ITEM).contains('Moderate').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();
    hasChip('Risk of change', 'Moderate');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Impact', () => {
    selectConditionalFilterOption('Impact');
    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();
    cy.get(MENU_ITEM).contains('High').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();
    hasChip('Impact', 'High');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Likelihood', () => {
    selectConditionalFilterOption('Likelihood');
    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();
    cy.get(MENU_ITEM).contains('High').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();
    hasChip('Likelihood', 'High');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Category', () => {
    selectConditionalFilterOption('Category');
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    cy.get(MENU_ITEM).contains('Stability').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    hasChip('Category', 'Stability');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Incidents', () => {
    selectConditionalFilterOption('Incidents');
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();
    cy.get(MENU_ITEM).contains('Incident').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();
    hasChip('Incidents', 'Incident');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Remediation Type', () => {
    selectConditionalFilterOption('Remediation type');
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();
    cy.get(MENU_ITEM).contains('Ansible playbook').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();
    hasChip('Remediation type', 'Ansible playbook');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });

  it('can filter by Reboot Required', () => {
    selectConditionalFilterOption('Reboot required');
    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();
    cy.get(MENU_ITEM).contains('Required').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();
    hasChip('Reboot required', 'Required');
    // Verify table shows filtered data
    cy.get(ROOT).find('tbody tr').should('have.length.at.least', 1);
  });
});

describe('New RulesTable (TableTools) - sorting', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
    cy.wait('@call'); // Wait for initial data load
  });

  it('sorts by Name in ascending order', () => {
    cy.contains('th button', 'Name').click();
    cy.wait('@call');
    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Name in descending order', () => {
    cy.contains('th button', 'Name').click();
    cy.wait('@call');
    cy.contains('th button', 'Name').click();
    cy.wait('@call');
    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('sorts by Total risk in ascending order', () => {
    // Total risk starts descending by default, one click toggles to ascending
    cy.contains('th button', 'Total risk').click();
    cy.wait('@call');
    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Total risk in descending order', () => {
    // Total risk is already descending by default
    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('resets to ascending when clicking a different column', () => {
    cy.contains('th button', 'Total risk').click();
    cy.wait('@call');
    cy.contains('th button', 'Name').click();
    cy.wait('@call');

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('not.have.attr', 'aria-sort');
  });
});

describe('New RulesTable (TableTools) - content', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it('has correct links', () => {
    const ruleName = fixtures.data[0].description;
    const ruleId = fixtures.data[0].rule_id;
    cy.get('tbody tr:first [data-label=Name] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${ruleId}`);
    cy.get('tbody tr:first [data-label=Name] a').should('contain', ruleName);
  });
});

describe('New RulesTable (TableTools) - Conditional Filter', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it('Name filter box correctly updates chips.', () => {
    cy.get('div.ins-c-primary-toolbar__filter').find('input').type('HTTP');
    hasChip('Name', 'HTTP');
  });
});

describe('New RulesTable (TableTools) - Tooltips', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  it(`Incident tooltip displays the correct content.`, () => {
    cy.get('.adv-c-label-incident').first().trigger('mouseenter');
    cy.contains(
      'Indicates configurations that are currently affecting your systems',
    ).should('be.visible');
  });

  it(`Critical tooltip displays the correct content.`, () => {
    cy.get('td[data-label="Total risk"] .pf-m-red')
      .first()
      .trigger('mouseenter');
    cy.contains(CRITICAL_TOOLTIP_CONTENT).should('be.visible');
  });

  it(`Important tooltip displays the correct content.`, () => {
    cy.get('td[data-label="Total risk"] .pf-m-orange')
      .first()
      .trigger('mouseenter');
    cy.contains(IMPORTANT_TOOLTIP_CONTENT).should('be.visible');
  });
});

describe('New RulesTable (TableTools) - Actions (Enable/Disable)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
  });

  it('shows enable action for disabled rules', () => {
    const disabledRule = {
      ...fixtures.data[0],
      rule_status: 'disabled',
    };

    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
        data: [disabledRule],
      },
    }).as('call');

    mountComponent();

    // Find actions kebab button in first row
    cy.get('[data-ouia-component-id="rules-table"] tbody tr')
      .first()
      .find('button[aria-label="Actions"]')
      .click();

    cy.contains('Enable rule').should('be.visible');
  });

  it('shows disable action for enabled rules', () => {
    const enabledRule = {
      ...fixtures.data[0],
      rule_status: 'enabled',
    };

    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
        data: [enabledRule],
      },
    }).as('call');

    mountComponent();

    // Find actions kebab button in first row
    cy.get('[data-ouia-component-id="rules-table"] tbody tr')
      .first()
      .find('button[aria-label="Actions"]')
      .click();

    cy.contains('Disable rule').should('be.visible');
  });

  it('does not show actions for rulesets', () => {
    const ruleset = {
      ...fixtures.data[0],
      rule_status: 'rulesets',
    };

    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
        data: [ruleset],
      },
    }).as('call');

    mountComponent();

    // No actions button should exist for rulesets
    cy.get('[data-ouia-component-id="rules-table"] tbody tr')
      .first()
      .find('button[aria-label="Actions"]')
      .should('not.exist');
  });
});

describe('New RulesTable (TableTools) - Permission-based UI Controls', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
  });

  describe('Export permissions', () => {
    it('renders export button when export permission granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: true,
        },
      );
      cy.get('button[aria-label="Export"]').should('exist');
    });

    it('does not render export button when export permission denied', () => {
      mountComponent(
        {},
        {
          isExportEnabled: false,
        },
      );
      cy.get('button[aria-label="Export"]').should('not.exist');
    });
  });

  describe('Disable recommendation permissions', () => {
    it('renders kebab when disable permission granted', () => {
      mountComponent(
        {},
        {
          isDisableRecEnabled: true,
        },
      );
      cy.get('button[aria-label="Kebab toggle"]').should('exist');
    });

    it('does not render kebab when disable permission denied', () => {
      mountComponent(
        {},
        {
          isDisableRecEnabled: false,
        },
      );
      cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
    });
  });

  describe('Combined permissions', () => {
    it('shows both export and disable when all permissions granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: true,
          isDisableRecEnabled: true,
        },
      );
      cy.get('button[aria-label="Export"]').should('exist');
      cy.get('button[aria-label="Kebab toggle"]').should('exist');
    });

    it('shows only export when only export permission granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: true,
          isDisableRecEnabled: false,
        },
      );
      cy.get('button[aria-label="Export"]').should('exist');
      cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
    });

    it('shows only disable when only disable permission granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: false,
          isDisableRecEnabled: true,
        },
      );
      cy.get('button[aria-label="Export"]').should('not.exist');
      cy.get('button[aria-label="Kebab toggle"]').should('exist');
    });

    it('shows neither export nor disable when no permissions granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: false,
          isDisableRecEnabled: false,
        },
      );
      cy.get('button[aria-label="Export"]').should('not.exist');
      cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
    });
  });
});
