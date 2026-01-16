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
  CHIP,
  CONDITIONAL_FILTER,
  hasChip,
  MENU_ITEM,
  PAGINATION_VALUES,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';
import {
  // eslint-disable-next-line no-unused-vars
  cumulativeCombinations,
  cypressApplyFilters,
} from '../../../cypress/utils/table';
import { filtersConf } from '../../../cypress/rulestablesconsts';
import { EnvironmentContext } from '../../App';

/**
 * Mounts the RulesTable component with a configurable environment context.
 * Stubs for chrome functions are automatically created and can be asserted on.
 *
 * @param {object} props - Properties for the component, including hasEdgeDevices.
 * @param {boolean} [props.hasEdgeDevices=false] - Whether the user has Edge devices.
 * @param {object} envContextOverrides - Optional overrides for the default EnvironmentContext values.
 * Use this to mock specific behaviors or permissions.
 */
const mountComponent = (
  { hasEdgeDevices = false } = {},
  envContextOverrides = {},
) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.mount(
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
    </EnvironmentContext.Provider>,
  );
};

/*
const expandContent = (rowNumber) => {
  cy.get('tbody[class="pf-v6-c-table__tbody pf-m-width-100"]')
    .eq(rowNumber)
    .find('button')
    .children()
    .eq(0)
    .should('exist')
    .click();
};
*/

const expandAll = () => {
  cy.get('button[aria-label="Expand all rows"]').click();
};

const filterApply = (filters) => cypressApplyFilters(filters, filtersConf);
const filterCombos = [{ impacting: ['1 or more'] }];

//the default count is 20, you can pass the other number if you need to
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
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
    //initial call
    cy.wait('@call');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('exist');
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
  });

  it('shows correct total number of rules', () => {
    checkPaginationTotal(fixtures.meta.count);
  });

  it('values are expected ones', () => {
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el).then(() => {
        expect(window.location.search).to.contain(`limit=${el}`);
      });
    });
  });
});

describe('filtering', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
  });

  it('can clear filters', () => {
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]')
      .find(CHIP)
      .find('button')
      .each(() => {
        cy.get('[data-ouia-component-type="PF6/ChipGroup"]')
          .find(CHIP)
          .find('button')
          .eq(0)
          .click();
      });
    //apply some filters
    filterApply(filterCombos[0]);
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      Object.keys(filterCombos[0]).length,
    );
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('exist');
    //clear filters
    cy.get('button').contains('Reset filters').click();
    //check default filters
    hasChip('Systems impacted', '1 or more');
    hasChip('Status', 'Enabled');
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      Object.keys(DEFAULT_FILTERS).length,
    );
    cy.get('button').contains('Reset filters').should('exist');
    //it is doubled because the expanded rows are also included
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    cy.intercept('**text=foobar**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('text=foobar');
    cy.intercept('**res_risk**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('res_risk=1');
    cy.intercept('**total_risk=1**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('total_risk=1');
    cy.intercept('**likelihood**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('likelihood=1');
    cy.intercept('**category**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('category=2');
    cy.intercept('**incident**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('incident=true');
    cy.intercept('**impact=1**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('impact=1');
    cy.intercept('**reboot=true**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('reboot=true');
    cy.intercept('**rule_status=all**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('rule_status=all');
    cy.intercept('**rule_status=disabled**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('rule_status=disabled');
    cy.intercept('**has_playbook=true**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('has_playbook=true');
    mountComponent(false);
  });

  Object.entries(filtersConf).forEach(([key, config]) => {
    const { urlParam, values, urlValue, selectorText } = config;

    it(`apply ${selectorText} filter`, () => {
      removeAllFilterChipsPf6();
      cy.get('button').contains('Reset filters').click();
      if (selectorText === 'Systems impacted') {
        cy.wait(['@call']);
        cy.wait(['@call']);
      } else {
        // Status = Enabled is a default value, so testing the second value instead
        const testValue = selectorText !== 'Status' ? values[0] : values[1];
        filterApply({ [key]: testValue });
        cy.wait(['@call']);
        cy.wait([`@${urlParam}=${urlValue(testValue)}`])
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(testValue)}`);
      }
    });
  });
});

describe('sorting', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
  });

  it('sorts by Name in ascending order', () => {
    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=description');
  });

  it('sorts by Name in descending order', () => {
    cy.get('th').contains('Name').click();
    cy.wait('@call');
    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.url().should('include', 'sort=-description');
  });

  it('sorts by Total risk in ascending order', () => {
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=total_risk');
  });

  it('sorts by Total risk in descending order', () => {
    cy.get('th').contains('Total risk').click();
    cy.wait('@call');
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.url().should('include', 'sort=-total_risk');
  });

  it('sorts by Systems count in ascending order', () => {
    cy.get('th').contains('Systems').click();

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=impacted_count');
  });

  it('sorts by Systems count in descending order', () => {
    cy.get('th').contains('Systems').click();
    cy.wait('@call');
    cy.get('th').contains('Systems').click();

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.url().should('include', 'sort=-impacted_count');
  });

  it('sorts by Category in ascending order', () => {
    cy.get('th').contains('Category').click();

    cy.get('th')
      .contains('Category')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=category');
  });

  it('sorts by Modified in ascending order', () => {
    cy.get('th').contains('Modified').click();

    cy.get('th')
      .contains('Modified')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=publish_date');
  });

  it('sorts by Remediation type in ascending order', () => {
    cy.get('th').contains('Remediation type').click();

    cy.get('th')
      .contains('Remediation type')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.url().should('include', 'sort=playbook_count');
  });

  it('resets to ascending when clicking a different column', () => {
    cy.get('th').contains('Total risk').click();
    cy.wait('@call');
    cy.get('th').contains('Total risk').click();
    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('th').contains('Name').click();

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

describe('pre-filled url search parameters', () => {
  it('loads sort from URL and applies to table', () => {
    const urlParams =
      'impacting=true&rule_status=enabled&sort=-total_risk&limit=20&offset=0#SIDs=&tags=';

    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    cy.mount(
      <MemoryRouter
        initialEntries={[`/recommendations?${urlParams}`]}
        initialIndex={0}
      >
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={initStore()}>
            <RulesTable />
          </Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });
});

describe('content', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
  });

  it(`Name filter box correctly updates chips.`, () => {
    // select Name filter
    selectConditionalFilterOption('Name');

    // enter a name
    // The ConditionalFilter ouiaId is assigned to the wrong element (input)
    cy.get('[aria-label="text input"]').click();
    cy.get('[aria-label="text input"]').type('Lorem');
    cy.get('[aria-label="text input"]').type('{enter}');

    // check chips updated
    hasChip('Name', 'Lorem');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Total risk filter box correctly updates chips.`, () => {
    // select Category filter
    selectConditionalFilterOption('Total risk');

    // select two categories
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Moderate').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    // check chips updated
    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Moderate');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Risk of change filter box correctly updates chips.`, () => {
    // select Category filter
    selectConditionalFilterOption('Risk of change');

    // select two categories
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();
    cy.get(MENU_ITEM).contains('High').click();
    cy.get(MENU_ITEM).contains('Low').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();

    // check chips updated
    hasChip('Risk of change', 'High');
    hasChip('Risk of change', 'Low');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Impact filter box correctly updates chips.`, () => {
    // select Category filter
    selectConditionalFilterOption('Impact');

    // select two categories
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Medium').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();

    // check chips updated
    hasChip('Impact', 'Critical');
    hasChip('Impact', 'Medium');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Likelihood filter box correctly updates chips.`, () => {
    // select Category filter
    selectConditionalFilterOption('Likelihood');

    // select two categories
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Medium').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();

    // check chips updated
    hasChip('Likelihood', 'Critical');
    hasChip('Likelihood', 'Medium');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Category filter box correctly updates chips.`, () => {
    // select Category filter
    selectConditionalFilterOption('Category');

    // select two categories
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    cy.get(MENU_ITEM).contains('Availability').click();
    cy.get(MENU_ITEM).contains('Stability').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();

    // check chips updated
    hasChip('Category', 'Availability');
    hasChip('Category', 'Stability');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Incidents filter box correctly updates chips.`, () => {
    // select Incidents filter
    selectConditionalFilterOption('Incidents');

    // select an option
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();
    cy.get(MENU_ITEM).contains('Non-incident').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();

    // check chips updated
    hasChip('Incidents', 'Non-incident');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Remediation filter box correctly updates chips.`, () => {
    // select Incidents filter
    selectConditionalFilterOption('Remediation');

    // select an option
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation').click();
    cy.get(MENU_ITEM).contains('Ansible playbook').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation').click();

    // check chips updated
    hasChip('Remediation', 'Ansible playbook');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Reboot required filter box correctly updates chips.`, () => {
    // select Reboot filter filter
    selectConditionalFilterOption('Reboot required');

    // select an option
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();
    cy.get(MENU_ITEM).contains('Required').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();

    // check chips updated
    hasChip('Reboot required', 'Required');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
  });

  it(`Status filter box correctly updates chips.`, () => {
    // select Reboot filter filter
    selectConditionalFilterOption('Status');

    // select an option
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by status').click();
    cy.get(MENU_ITEM).contains('Disabled').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by status').click();

    // check chips updated
    hasChip('Status', 'Disabled');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );
    hasChip('Status', 'Enabled');
  });

  it(`Systems impacted filter box correctly updates chips.`, () => {
    // select Reboot filter filter
    selectConditionalFilterOption('Systems impacted');

    // select None
    // There are multiple elements with the ConditionalFilter ouia id
    cy.get(CONDITIONAL_FILTER).contains('Filter by systems impacted').click();
    cy.get(MENU_ITEM).contains('None').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by systems impacted').click();

    // check chips updated
    hasChip('Systems impacted', 'None');

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips reset to defaults
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      2,
    );

    // unselect 1 or more
    cy.get(CONDITIONAL_FILTER).contains('Filter by systems impacted').click();
    cy.get(MENU_ITEM).contains('1 or more').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by systems impacted').click();

    // check chips updated
    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should(
      'have.length',
      1,
    );

    // reset
    cy.get('button').contains('Reset filters').click();

    // check chips are reset
    hasChip('Systems impacted', '1 or more');
  });
});

describe('Tooltips', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent(false);
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
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
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
    // Ensure requestPdf is NOT called, as itExportsDataToFile likely simulates a direct download
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});

describe('Disable kebab recommendation', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
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

describe('URL parameter synchronization', () => {
  const mountComponentWithUrl = (urlParams) => {
    let envContext = createTestEnvironmentContext();

    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    // Set URL parameters in browser history so paramParser() can read them
    cy.window().then((win) => {
      win.history.pushState({}, '', `/recommendations?${urlParams}`);
    });

    cy.mount(
      <EnvironmentContext.Provider value={envContext}>
        <MemoryRouter
          initialEntries={[`/recommendations?${urlParams}`]}
          initialIndex={0}
        >
          <AccountStatContext.Provider
            value={{ hasEdgeDevices: false, edgeQuerySuccess: true }}
          >
            <IntlProvider
              locale={navigator.language.slice(0, 2)}
              messages={messages}
            >
              <Provider store={initStore()}>
                <Routes>
                  <Route
                    key={'Recommendations'}
                    path="*"
                    element={<RulesTable isTabActive={true} />}
                  />
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );
  };

  it('loads total_risk filter from URL parameters', () => {
    const urlParams = 'total_risk=4&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]')
      .contains('Critical')
      .should('exist');
  });

  it('loads pagination from URL parameters', () => {
    const urlParams = 'limit=20&offset=0&impacting=true&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('.pf-v6-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 20');
  });

  it('loads search text from URL parameters', () => {
    const urlParams = 'text=kernel&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Name', 'kernel');
  });

  it('loads multiple filters from URL parameters', () => {
    const urlParams =
      'total_risk=4,3&category=1&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Important');
    hasChip('Category', 'Availability');
  });

  it('updates URL when filters are applied', () => {
    mountComponentWithUrl('rule_status=enabled&impacting=true');
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.location('search').should('include', 'total_risk=4');
  });

  it('updates URL when pagination changes', () => {
    mountComponentWithUrl('rule_status=enabled&impacting=true');
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('[class*="pf-v6-c-pagination"]')
      .find('button[class*="toggle"]')
      .first()
      .click();
    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('50').click();

    cy.location('search').should('include', 'limit=50');
    cy.location('search').should('include', 'offset=0');
  });

  it('updates URL when navigating to next page', () => {
    mountComponentWithUrl(
      'limit=20&offset=0&rule_status=enabled&impacting=true',
    );
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('button[data-action="next"]').first().click();

    cy.location('search').should('include', 'offset=20');
    cy.location('search').should('include', 'limit=20');
  });

  it('loads combined filters and pagination from URL', () => {
    const urlParams =
      'total_risk=4&text=kernel&limit=10&offset=0&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Total risk', 'Critical');
    hasChip('Name', 'kernel');

    cy.contains('1 - 10 of').should('exist');
  });

  it('loads category filter from URL', () => {
    const urlParams = 'category=1&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Category', 'Availability');
  });

  it('loads impact filter from URL', () => {
    const urlParams = 'impact=4&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Impact', 'Critical');
  });

  it('loads likelihood filter from URL', () => {
    const urlParams = 'likelihood=4&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Likelihood', 'Critical');
  });

  it('loads risk of change filter from URL', () => {
    const urlParams = 'res_risk=4&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Risk of change', 'High');
  });

  it('loads remediation type filter from URL', () => {
    const urlParams = 'has_playbook=true&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Remediation', 'Ansible playbook');
  });

  it('loads incidents filter from URL', () => {
    const urlParams = 'incident=true&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Incidents', 'Incident');
  });

  it('loads reboot required filter from URL', () => {
    const urlParams = 'reboot=true&rule_status=enabled&impacting=true';
    mountComponentWithUrl(urlParams);
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    hasChip('Reboot required', 'Required');
  });

  it('maintains sort and filters together', () => {
    mountComponentWithUrl('rule_status=enabled&impacting=true');
    cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

    cy.get('th').contains('Systems').click();

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    hasChip('Total risk', 'Critical');

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.location('search').should('include', 'total_risk=4');
    cy.location('search').should('include', 'sort=impacted_count');
  });
});
