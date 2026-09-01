import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import _ from 'lodash';
import {
  createTestEnvironmentContext,
  rulesTableColumns,
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
  changePagination,
  checkPaginationTotal,
  checkPaginationValues,
  checkRowCounts,
  checkTableHeaders,
  CONDITIONAL_FILTER,
  MENU_ITEM,
  PAGINATION_VALUES,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { cypressApplyFilters } from '../../../cypress/utils/table';
import { filtersConf } from '../../../cypress/rulestablesconsts';
import { EnvironmentContext } from '../../App';

/**
 * Mounts the RulesTable component with tabletools enabled.
 * Stubs for chrome functions are automatically created and can be asserted on.
 *
 * @param {object} props - Props object for AccountStatContext
 * @param {object} envContextOverrides - Optional overrides for the default EnvironmentContext values.
 */
const flagProviderConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};

const mountComponent = (props = {}, envContextOverrides = {}) => {
  const hasEdgeDevices = props.hasEdgeDevices || false;

  // Always enable tabletools for this test file
  featureFlagInterceptor(['advisor-tabletools-migration']);

  // Intercept Unleash metrics POST requests
  cy.intercept('POST', '/feature_flags/client/metrics', { statusCode: 200 });

  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.intercept('GET', '/feature_flags*', {
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
                    element={<RulesTable />}
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
  cy.get('button[aria-label="Expand all rows"]').click();
};

const filterApply = (filters) => cypressApplyFilters(filters, filtersConf);
const filterCombos = [{ impacting: ['1 or more'] }];

const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(rulesTableColumns, (it) => it.title);
const ROOT = 'table[data-ouia-component-id=rules-table]';
const CRITICAL_TOOLTIP_CONTENT =
  'The total risk of this remediation is critical, based on the combination of likelihood and impact to remediate.';
const IMPORTANT_TOOLTIP_CONTENT =
  'The total risk of this remediation is important, based on the combination of likelihood and impact to remediate.';

describe('test data', () => {
  it('the first recommendation has systems impacted', () => {
    expect(fixtures.data[0].impacted_systems_count).be.gt(0);
  });
});

describe('renders correctly', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
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

describe('defaults', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('.pf-v6-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
  });

  it('sorting using Total risk', () => {
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    const column = 'Total risk';
    cy.tableIsSortedBy(column);
  });

  it('links to the recommendations detail page', () => {
    cy.get('tbody tr:first [data-label="Name"] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
    cy.get('tbody tr:first [data-label="Systems"] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
  });

  it('applies total risk "Enabled" and systems impacted "1 or more" filters', () => {
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('exist');
  });

  it('name filter is a default filter', () => {
    cy.get('button[aria-label="Conditional filter toggle"]')
      .find('span[class=ins-c-conditional-filter__value-selector]')
      .should('have.text', 'Name');
    cy.get(CONDITIONAL_FILTER).should('exist');
  });

  it('reset filters button is displayed', () => {
    cy.get('button').contains('Reset filters').should('exist');
  });
});

describe('pagination', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it('shows correct total number of rules', () => {
    checkPaginationTotal(fixtures.meta.count);
  });

  it('values are expected ones', () => {
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el);
    });
  });
});

describe('filtering', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it('can clear filters', () => {
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group')
      .find('.pf-v6-c-label')
      .find('button')
      .each(() => {
        cy.get('.ins-c-chip-filters .pf-v6-c-label-group')
          .find('.pf-v6-c-label')
          .find('button')
          .eq(0)
          .click();
      });
    filterApply(filterCombos[0]);
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should(
      'have.length',
      Object.keys(filterCombos[0]).length,
    );
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('exist');
    cy.get('button').contains('Reset filters').click();
    hasChip('Systems impacted', '1 or more');
    hasChip('Status', 'Enabled');
    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should(
      'have.length',
      Object.keys(DEFAULT_FILTERS).length,
    );
    cy.get('button').contains('Reset filters').should('exist');
    checkRowCounts(DEFAULT_ROW_COUNT * 2);
  });

  it('no filters show all recommendations', () => {
    removeAllFilterChipsPf6();
    checkRowCounts(DEFAULT_ROW_COUNT * 2);
    checkPaginationTotal(fixtures.meta.count);
  });

  it('will reset filters but not pagination and sorting', () => {
    filterApply({ name: 'Lo' });

    cy.get('th[data-label="Name"]').find('button').click();
    cy.get(TOOLBAR).find('button').contains('Reset filters').click();
    cy.get('th[data-label="Name"]')
      .should('have.attr', 'aria-sort')
      .and('contain', 'ascending');
  });
});

describe('making request based on filters', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  Object.entries(filtersConf).forEach(([key, config]) => {
    const { urlParam, values, urlValue, selectorText } = config;

    it(`apply ${selectorText} filter`, () => {
      removeAllFilterChipsPf6();
      cy.get('button').contains('Reset filters').click();
      if (selectorText === 'Systems impacted') {
        cy.wait(['@getRules']);
        cy.wait(['@getRules']);
      } else {
        const testValue = selectorText !== 'Status' ? values[0] : values[1];

        cy.intercept(
          'GET',
          `/api/insights/v1/rule/*${urlParam}=${urlValue(testValue)}*`,
        ).as('filteredRequest');
        filterApply({ [key]: testValue });
        cy.wait('@filteredRequest')
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(testValue)}`);
      }
    });
  });
});

describe('sorting', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
  });

  it('sorts by Name in ascending order', () => {
    cy.get('th').contains('Name').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Name in descending order', () => {
    cy.get('th').contains('Name').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('th').contains('Name').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('sorts by Total risk in ascending order', () => {
    cy.get('th').contains('Total risk').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Total risk in descending order', () => {
    cy.get('th').contains('Total risk').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('sorts by Systems count in ascending order', () => {
    cy.get('th').contains('Systems').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Systems count in descending order', () => {
    cy.get('th').contains('Systems').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('th').contains('Systems').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('sorts by Category in ascending order', () => {
    cy.get('th').contains('Category').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Category')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Modified in ascending order', () => {
    cy.get('th').contains('Modified').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Modified')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('sorts by Remediation type in ascending order', () => {
    cy.get('th').contains('Remediation type').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get('th')
      .contains('Remediation type')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');
  });

  it('resets to ascending when clicking a different column', () => {
    cy.get('th').contains('Total risk').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('th').contains('Total risk').click();
    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('th').contains('Name').click();
    cy.wait('@getRules');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

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

describe('content', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it('has correct links', () => {
    expandAll();

    cy.get('tbody tr[class*="__expandable-row"]').then((rows) => {
      Array.from(rows).forEach((row, index) => {
        if (!(fixtures.data[index].node_id === '')) {
          cy.log(fixtures.data[index].rule_id);
          cy.wrap(row)
            .find('a')
            .contains('Knowledgebase article')
            .should(
              'have.attr',
              'href',
              'https://access.redhat.com/node/' + fixtures.data[index].node_id,
            );
        }

        const viewStr =
          fixtures.data[index].impacted_systems_count > 1
            ? `View ${fixtures.data[index].impacted_systems_count} affected systems`
            : `View the affected system`;
        cy.wrap(row)
          .find('a')
          .contains(viewStr)
          .should(
            'have.attr',
            'href',
            '///recommendations/' + fixtures.data[index].rule_id,
          );
      });
    });
  });
});

describe('Conditional Filter', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
    mountComponent();
  });

  it('text filter updates chips', () => {
    // Tests Name filter (text input mechanism)
    selectConditionalFilterOption('Name');

    cy.get('[aria-label="text input"]').click();
    cy.get('[aria-label="text input"]').type('Lorem');
    cy.get('[aria-label="text input"]').type('{enter}');

    hasChip('Name', 'Lorem');

    cy.get('button').contains('Reset filters').click();

    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('have.length', 2);
  });

  it('multi-select filter updates chips', () => {
    // Tests Total Risk filter (checkbox multi-select mechanism)
    selectConditionalFilterOption('Total risk');

    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Moderate').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Moderate');

    cy.get('button').contains('Reset filters').click();

    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('have.length', 2);
  });

  it('boolean filter updates chips', () => {
    // Tests Incidents filter (boolean toggle mechanism)
    selectConditionalFilterOption('Incidents');

    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();
    cy.get(MENU_ITEM).contains('Non-incident').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();

    hasChip('Incidents', 'Non-incident');

    cy.get('button').contains('Reset filters').click();

    cy.get('.ins-c-chip-filters .pf-v6-c-label-group').should('have.length', 2);
  });
});

describe('Tooltips', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
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

describe('Export', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
  });
  it(`download button not rendered if export not enabled`, () => {
    mountComponent(
      {},
      {
        isExportEnabled: false,
      },
    );
    cy.get('button[aria-label="Export"]').should('not.exist');
  });

  it(`download button tooltip displays the correct content if enabled`, () => {
    mountComponent(
      {},
      {
        isExportEnabled: true,
      },
    );
    cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
    cy.contains('Export data').should('be.visible');
  });

  it(`works and downloads report is enabled`, () => {
    mountComponent();
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});

describe('Disable kebab recommendation', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
  });
  it(`is not rendered if isDisableRecEnabled is false`, () => {
    mountComponent(
      {},
      {
        isDisableRecEnabled: false,
      },
    );
    cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
  });

  it(`is rendered and enabled when isDisableRecEnabled is true`, () => {
    mountComponent(
      {},
      {
        isDisableRecEnabled: true,
      },
    );
    cy.clickOnRowKebab(
      'Reboot fails when there is no "kernelopts" option in the grubenv',
    );
    cy.contains('Disable recommendation').should('be.visible');
    cy.get('button[aria-label="Kebab toggle"]').should('exist');
  });
});

describe('Permission-based UI Controls', () => {
  beforeEach(() => {
    rulesTableApiInterceptor(fixtures);
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

    it('hides export button when export permission denied', () => {
      mountComponent(
        {},
        {
          isExportEnabled: false,
        },
      );
      cy.get('button[aria-label="Export"]').should('not.exist');
    });

    it('export button is functional when permission granted', () => {
      mountComponent(
        {},
        {
          isExportEnabled: true,
        },
      );
      cy.get('button[aria-label="Export"]')
        .should('exist')
        .and('not.be.disabled');
    });
  });

  describe('Disable recommendation permissions', () => {
    it('renders kebab menu when disable permission granted', () => {
      mountComponent(
        {},
        {
          isDisableRecEnabled: true,
        },
      );
      cy.get('button[aria-label="Kebab toggle"]').should('exist');
    });

    it('hides kebab menu when disable permission denied', () => {
      mountComponent(
        {},
        {
          isDisableRecEnabled: false,
        },
      );
      cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
    });

    it('disable recommendation option is available when permission granted', () => {
      mountComponent(
        {},
        {
          isDisableRecEnabled: true,
        },
      );
      cy.clickOnRowKebab(
        'Reboot fails when there is no "kernelopts" option in the grubenv',
      );
      cy.contains('Disable recommendation').should('be.visible');
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
