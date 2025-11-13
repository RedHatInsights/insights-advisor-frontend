/* eslint-disable cypress/no-unnecessary-waiting */
import React from 'react';
import NewRulesTable from './NewRulesTable';
import fixtures from '../../../cypress/fixtures/newrecommendations.json';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import messages from '../../Messages';
import { selectConditionalFilterOption } from '../../../cypress/utils/table';
import {
  CONDITIONAL_FILTER,
  hasChip,
  MENU_ITEM,
} from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { EnvironmentContext } from '../../App';
import { DEFAULT_TEST_ENVIRONMENT_CONTEXT } from '../../Utilities/TestingUtilities';
import { initStore } from '../../Store';

const ROOT = 'table[data-ouia-component-id=rules-table]';

const mountComponentWithUrl = (urlParams, props = {}) => {
  const store = initStore();

  cy.mount(
    <EnvironmentContext.Provider value={DEFAULT_TEST_ENVIRONMENT_CONTEXT}>
      <MemoryRouter
        initialEntries={[`/recommendations?${urlParams}`]}
        initialIndex={0}
      >
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <Routes>
              <Route
                path="*"
                element={
                  <NewRulesTable
                    rules={fixtures.data}
                    isDisableRecEnabled={true}
                    refetch={() => {}}
                    {...props}
                  />
                }
              />
            </Routes>
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    </EnvironmentContext.Provider>,
  );
};

const mountComponent = (props = {}) => {
  mountComponentWithUrl('', props);
};

describe('test data', () => {
  it('the first recommendation has systems impacted', () => {
    expect(fixtures.data[0].impacted_systems_count).be.gt(0);
  });
});

describe('renders correctly', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('The Rules table renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });

  it('renders toolbar', () => {
    cy.get('[class*="pf-v6-c-toolbar"]').should('exist');
  });

  it('renders table headers', () => {
    cy.contains('th', 'Name').should('exist');
    cy.contains('th', 'Modified').should('exist');
    cy.contains('th', 'Category').should('exist');
    cy.contains('th', 'Total risk').should('exist');
    cy.contains('th', 'Systems').should('exist');
    cy.contains('th', 'Remediation type').should('exist');
  });

  it('displays PrimaryToolbar with correct count', () => {
    cy.contains(`1 - 20 of ${fixtures.data.length}`).should('exist');
  });

  it('links to the recommendations detail page', () => {
    cy.get('tbody tr:first [data-label=Name] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
    cy.get('tbody tr:first [data-label=Systems] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
  });
});

describe('content', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('displays the first rule from fixtures', () => {
    const firstRule = fixtures.data[0];
    cy.contains('td', firstRule.description).should('exist');
  });

  fixtures.data.slice(0, 5).forEach((rule, index) => {
    it(`displays rule ${index + 1}: "${rule.description}"`, () => {
      cy.contains('td', rule.description).should('exist');

      if (rule.category?.name) {
        cy.contains('td', rule.category.name).should('exist');
      }

      cy.contains('td', String(rule.impacted_systems_count)).should('exist');

      const remediationType = rule.playbook_count ? 'Playbook' : 'Manual';
      cy.get('tbody tr')
        .eq(index * 2)
        .contains(remediationType)
        .should('exist');
    });
  });
});

describe('row expansion', () => {
  fixtures.data.slice(0, 3).forEach((rule, index) => {
    it(`can expand row ${index + 1} for "${rule.description}"`, () => {
      mountComponent();
      cy.get(ROOT).should('be.visible');

      cy.get('tbody button[aria-label="Details"]')
        .eq(index)
        .click({ force: true });

      if (rule.node_id) {
        cy.contains('a', 'Knowledgebase article').should('exist');
      }
      if (rule.impacted_systems_count > 0) {
        cy.contains('a', 'affected system').should('exist');
      }
    });
  });
});

describe('date formatting', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('displays formatted relative dates in Modified column', () => {
    cy.get('td[data-label="Modified"]').first().should('contain', 'ago');
  });

  fixtures.data.slice(0, 3).forEach((rule, index) => {
    it(`displays formatted date for rule ${index + 1}`, () => {
      cy.get('td[data-label="Modified"]').eq(index).should('contain', 'ago');
    });
  });
});

describe('total risk labels', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('displays InsightsLabel badges', () => {
    cy.get('td[data-label="Total risk"]')
      .first()
      .find('.pf-v6-c-label')
      .should('exist');
  });

  it('displays different risk levels with correct colors', () => {
    cy.get('td[data-label="Total risk"] .pf-v6-c-label.pf-m-red').should(
      'exist',
    );
    cy.get('td[data-label="Total risk"] .pf-v6-c-label.pf-m-orange').should(
      'exist',
    );
  });

  fixtures.data.slice(0, 5).forEach((rule, index) => {
    it(`displays correct risk label for rule ${index + 1} (risk level ${rule.total_risk})`, () => {
      const riskClasses = {
        1: 'pf-m-green',
        2: 'pf-m-yellow',
        3: 'pf-m-orange',
        4: 'pf-m-red',
      };

      cy.get('td[data-label="Total risk"]')
        .eq(index)
        .find('.pf-v6-c-label')
        .should('exist')
        .and('have.class', riskClasses[rule.total_risk]);
    });
  });
});

describe('Conditional Filter', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('Name filter box correctly updates chips', () => {
    selectConditionalFilterOption('Name');

    cy.get('[aria-label="text input"]').click();
    cy.get('[aria-label="text input"]').type('ansible');
    cy.get('[aria-label="text input"]').type('{enter}');

    hasChip('Name', 'ansible');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Total risk filter box correctly updates chips', () => {
    selectConditionalFilterOption('Total risk');

    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Moderate').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Moderate');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Risk of change filter box correctly updates chips', () => {
    selectConditionalFilterOption('Risk of change');

    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();
    cy.get(MENU_ITEM).contains('High').click();
    cy.get(MENU_ITEM).contains('Low').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by risk of change').click();

    hasChip('Risk of change', 'High');
    hasChip('Risk of change', 'Low');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Impact filter box correctly updates chips', () => {
    selectConditionalFilterOption('Impact');

    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Medium').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by impact').click();

    hasChip('Impact', 'Critical');
    hasChip('Impact', 'Medium');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Likelihood filter box correctly updates chips', () => {
    selectConditionalFilterOption('Likelihood');

    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Medium').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by likelihood').click();

    hasChip('Likelihood', 'Critical');
    hasChip('Likelihood', 'Medium');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Category filter box correctly updates chips', () => {
    selectConditionalFilterOption('Category');

    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    cy.get(MENU_ITEM).contains('Availability').click();
    cy.get(MENU_ITEM).contains('Stability').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();

    hasChip('Category', 'Availability');
    hasChip('Category', 'Stability');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Incidents filter box correctly updates chips', () => {
    selectConditionalFilterOption('Incidents');

    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();
    cy.get(MENU_ITEM).contains('Non-incident').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by incidents').click();

    hasChip('Incidents', 'Non-incident');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Remediation type filter box correctly updates chips', () => {
    selectConditionalFilterOption('Remediation type');

    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();
    cy.get(MENU_ITEM).contains('Ansible playbook').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();

    hasChip('Remediation type', 'Ansible playbook');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });

  it('Reboot required filter box correctly updates chips', () => {
    selectConditionalFilterOption('Reboot required');

    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();
    cy.get(MENU_ITEM).contains('Required').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by reboot required').click();

    hasChip('Reboot required', 'Required');

    cy.get('button').contains('Reset filters').click();

    cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
  });
});

describe('filtering table rows', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('filters table by name/search text and shows correct results', () => {
    const searchTerm = 'ansible';
    const totalCount = fixtures.data.length;

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(20, totalCount));

    selectConditionalFilterOption('Name');
    cy.get('[aria-label="text input"]').type(searchTerm);
    cy.get('[aria-label="text input"]').type('{enter}');

    cy.wait(700);

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Name"]')
          .invoke('text')
          .should('match', new RegExp(searchTerm, 'i'));
      });

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.lessThan', 20);
  });

  it('filters table by total risk and shows only matching risk levels', () => {
    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Total risk"] .pf-v6-c-label')
          .should('have.class', 'pf-m-red');
      });

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('filters table by multiple total risk levels', () => {
    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(MENU_ITEM).contains('Important').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Total risk"] .pf-v6-c-label')
          .should('satisfy', ($label) => {
            return (
              $label.hasClass('pf-m-red') || $label.hasClass('pf-m-orange')
            );
          });
      });
  });

  it('filters table by category and shows only matching categories', () => {
    selectConditionalFilterOption('Category');
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    cy.get(MENU_ITEM).contains('Availability').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Category"]')
          .should('contain', 'Availability');
      });
  });

  it('filters table by remediation type (Ansible playbook)', () => {
    selectConditionalFilterOption('Remediation type');
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();
    cy.get(MENU_ITEM).contains('Ansible playbook').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Remediation type"]')
          .should('contain', 'Playbook');
      });

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('filters table by remediation type (Manual)', () => {
    selectConditionalFilterOption('Remediation type');
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();
    cy.get(MENU_ITEM).contains('Manual').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by remediation type').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Remediation type"]')
          .should('contain', 'Manual');
      });
  });

  it('combines multiple filters and shows correct results', () => {
    const searchTerm = 'kernel';

    selectConditionalFilterOption('Name');
    cy.get('[aria-label="text input"]').type(searchTerm);
    cy.get('[aria-label="text input"]').type('{enter}');

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Name"]')
          .invoke('text')
          .should('match', new RegExp(searchTerm, 'i'));

        cy.wrap($row)
          .find('td[data-label="Total risk"] .pf-v6-c-label')
          .should('have.class', 'pf-m-red');
      });

    hasChip('Name', searchTerm);
    hasChip('Total risk', 'Critical');
  });

  it('shows empty state when filters match nothing', () => {
    selectConditionalFilterOption('Name');
    cy.get('[aria-label="text input"]').type('xyzqwertynonexistent123');
    cy.get('[aria-label="text input"]').type('{enter}');

    cy.get('tbody tr').should('have.length', 1); // One row containing empty state
    cy.get('tbody tr td[colspan="8"]').should('exist'); // Empty state cell spans all columns (7 + 1 action column)

    cy.contains('0 - 0 of 0').should('exist');
  });

  it('clears filters and restores all rows', () => {
    const totalCount = fixtures.data.length;

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.lessThan', 20);

    cy.get('button').contains('Reset filters').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(20, totalCount));

    cy.contains(`1 - ${Math.min(20, totalCount)} of ${totalCount}`).should(
      'exist',
    );
  });

  it('updates pagination count when filtering', () => {
    const initialCount = fixtures.data.length;

    cy.contains(`1 - ${Math.min(20, initialCount)} of ${initialCount}`).should(
      'exist',
    );

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .its('length')
      .then((filteredCount) => {
        cy.contains(
          `1 - ${Math.min(20, filteredCount)} of ${filteredCount}`,
        ).should('exist');
      });
  });
});

describe('sorting', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('sorts by Name in ascending order', () => {
    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const names = [];
        $rows.each((index, row) => {
          const name = Cypress.$(row)
            .find('td[data-label="Name"]')
            .text()
            .trim();
          const cleanName = name.split(/Incident|New|Updated/)[0].trim();
          names.push(cleanName);
        });

        const sortedNames = [...names].sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase()),
        );
        expect(names).to.deep.equal(sortedNames);
      });
  });

  it('sorts by Name in descending order', () => {
    cy.get('th').contains('Name').click();
    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const names = [];
        $rows.each((index, row) => {
          const name = Cypress.$(row)
            .find('td[data-label="Name"]')
            .text()
            .trim();
          const cleanName = name.split(/Incident|New|Updated/)[0].trim();
          names.push(cleanName);
        });

        const sortedNames = [...names].sort((a, b) =>
          b.toLowerCase().localeCompare(a.toLowerCase()),
        );
        expect(names).to.deep.equal(sortedNames);
      });
  });

  it('sorts by Total risk in ascending order', () => {
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const riskLevels = [];
        $rows.each((index, row) => {
          const $label = Cypress.$(row).find(
            'td[data-label="Total risk"] .pf-v6-c-label',
          );
          if ($label.hasClass('pf-m-green')) riskLevels.push(1);
          else if ($label.hasClass('pf-m-yellow')) riskLevels.push(2);
          else if ($label.hasClass('pf-m-orange')) riskLevels.push(3);
          else if ($label.hasClass('pf-m-red')) riskLevels.push(4);
        });

        const sortedLevels = [...riskLevels].sort((a, b) => a - b);
        expect(riskLevels).to.deep.equal(sortedLevels);
      });
  });

  it('sorts by Total risk in descending order', () => {
    cy.get('th').contains('Total risk').click();
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const riskLevels = [];
        $rows.each((index, row) => {
          const $label = Cypress.$(row).find(
            'td[data-label="Total risk"] .pf-v6-c-label',
          );
          if ($label.hasClass('pf-m-green')) riskLevels.push(1);
          else if ($label.hasClass('pf-m-yellow')) riskLevels.push(2);
          else if ($label.hasClass('pf-m-orange')) riskLevels.push(3);
          else if ($label.hasClass('pf-m-red')) riskLevels.push(4);
        });

        const sortedLevels = [...riskLevels].sort((a, b) => b - a);
        expect(riskLevels).to.deep.equal(sortedLevels);
      });
  });

  it('sorts by Systems count in ascending order', () => {
    cy.get('th').contains('Systems').click();

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const counts = [];
        $rows.each((index, row) => {
          const countText = Cypress.$(row)
            .find('td[data-label="Systems"]')
            .text()
            .trim();
          const count = parseInt(countText.replace(/,/g, ''));
          counts.push(count);
        });

        const sortedCounts = [...counts].sort((a, b) => a - b);
        expect(counts).to.deep.equal(sortedCounts);
      });
  });

  it('sorts by Systems count in descending order', () => {
    cy.get('th').contains('Systems').click();
    cy.get('th').contains('Systems').click();

    cy.get('th')
      .contains('Systems')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const counts = [];
        $rows.each((index, row) => {
          const countText = Cypress.$(row)
            .find('td[data-label="Systems"]')
            .text()
            .trim();
          const count = parseInt(countText.replace(/,/g, ''));
          counts.push(count);
        });

        const sortedCounts = [...counts].sort((a, b) => b - a);
        expect(counts).to.deep.equal(sortedCounts);
      });
  });

  it('sorts by Category in ascending order', () => {
    cy.get('th').contains('Category').click();

    cy.get('th')
      .contains('Category')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const categories = [];
        $rows.each((index, row) => {
          const category = Cypress.$(row)
            .find('td[data-label="Category"]')
            .text()
            .trim();
          categories.push(category.toLowerCase());
        });

        const sortedCategories = [...categories].sort();
        expect(categories).to.deep.equal(sortedCategories);
      });
  });

  it('maintains sorting when filters are applied', () => {
    cy.get('th').contains('Total risk').click();
    cy.get('th').contains('Total risk').click();

    selectConditionalFilterOption('Category');
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();
    cy.get(MENU_ITEM).contains('Availability').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by category').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const riskLevels = [];
        $rows.each((index, row) => {
          const $label = Cypress.$(row).find(
            'td[data-label="Total risk"] .pf-v6-c-label',
          );
          if ($label.hasClass('pf-m-green')) riskLevels.push(1);
          else if ($label.hasClass('pf-m-yellow')) riskLevels.push(2);
          else if ($label.hasClass('pf-m-orange')) riskLevels.push(3);
          else if ($label.hasClass('pf-m-red')) riskLevels.push(4);
        });

        const sortedLevels = [...riskLevels].sort((a, b) => b - a);
        expect(riskLevels).to.deep.equal(sortedLevels);
      });
  });

  it('resets to ascending when clicking a different column', () => {
    cy.get('th').contains('Total risk').click();
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

describe('pagination', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('displays correct pagination text for first page', () => {
    const totalCount = fixtures.data.length;
    const itemsOnPage = Math.min(20, totalCount);
    cy.contains(`1 - ${itemsOnPage} of ${totalCount}`).should('exist');
  });

  it('shows only 20 items per page by default', () => {
    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(20, fixtures.data.length));
  });

  it('navigates to page 2 and shows correct rows', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('button[data-action="next"]').first().click();

      const startItem = 21;
      const endItem = Math.min(40, totalCount);
      cy.contains(`${startItem} - ${endItem} of ${totalCount}`).should('exist');

      const expectedRows = endItem - startItem + 1;
      cy.get('tbody tr')
        .not('.pf-v6-c-table__expandable-row')
        .should('have.length', expectedRows);
    }
  });

  it('changes items per page to 10', () => {
    cy.get('[class*="pf-v6-c-pagination"]')
      .find('button[class*="toggle"]')
      .first()
      .click();

    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('10').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(10, fixtures.data.length));

    const totalCount = fixtures.data.length;
    const itemsOnPage = Math.min(10, totalCount);
    cy.contains(`1 - ${itemsOnPage} of ${totalCount}`).should('exist');
  });

  it('resets to page 1 when applying filters', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('button[data-action="next"]').first().click();
      cy.contains(/21 - \d+ of \d+/).should('exist');

      selectConditionalFilterOption('Total risk');
      cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
      cy.get(MENU_ITEM).contains('Critical').click();
      cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

      cy.contains(/^1 - \d+ of \d+/).should('exist');
    }
  });

  it('can navigate to last page', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('button[data-action="last"]').first().click();

      const lastPageStart = Math.floor((totalCount - 1) / 20) * 20 + 1;
      const lastPageEnd = totalCount;

      cy.contains(`${lastPageStart} - ${lastPageEnd} of ${totalCount}`).should(
        'exist',
      );

      const expectedRows = lastPageEnd - lastPageStart + 1;
      cy.get('tbody tr')
        .not('.pf-v6-c-table__expandable-row')
        .should('have.length', expectedRows);
    }
  });
});

describe('footer pagination', () => {
  beforeEach(() => {
    mountComponent();
    cy.get(ROOT).should('be.visible');
  });

  it('displays footer pagination component', () => {
    cy.get('[data-ouia-component-id="page-bottom"]').should('exist');
  });

  it('footer displays correct pagination text for first page', () => {
    const totalCount = fixtures.data.length;
    const itemsOnPage = Math.min(20, totalCount);

    cy.get('[data-ouia-component-id="page-bottom"]')
      .contains(`1 - ${itemsOnPage} of ${totalCount}`)
      .should('exist');
  });

  it('footer pagination navigates to page 2 and shows correct rows', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('[data-ouia-component-id="page-bottom"]')
        .find('button[data-action="next"]')
        .click();

      const startItem = 21;
      const endItem = Math.min(40, totalCount);
      cy.get('[data-ouia-component-id="page-bottom"]')
        .contains(`${startItem} - ${endItem} of ${totalCount}`)
        .should('exist');

      const expectedRows = endItem - startItem + 1;
      cy.get('tbody tr')
        .not('.pf-v6-c-table__expandable-row')
        .should('have.length', expectedRows);
    }
  });

  it('footer pagination changes items per page to 10', () => {
    cy.get('[data-ouia-component-id="page-bottom"]')
      .find('button[class*="toggle"]')
      .first()
      .click();

    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('10').click();

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(10, fixtures.data.length));

    const totalCount = fixtures.data.length;
    const itemsOnPage = Math.min(10, totalCount);
    cy.get('[data-ouia-component-id="page-bottom"]')
      .contains(`1 - ${itemsOnPage} of ${totalCount}`)
      .should('exist');
  });

  it('footer and header pagination are synchronized', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('button[data-action="next"]').first().click();

      const startItem = 21;
      const endItem = Math.min(40, totalCount);

      cy.get('[class*="pf-v6-c-toolbar"]')
        .contains(`${startItem} - ${endItem} of ${totalCount}`)
        .should('exist');

      cy.get('[data-ouia-component-id="page-bottom"]')
        .contains(`${startItem} - ${endItem} of ${totalCount}`)
        .should('exist');
    }
  });

  it('footer pagination can navigate to last page', () => {
    const totalCount = fixtures.data.length;

    if (totalCount > 20) {
      cy.get('[data-ouia-component-id="page-bottom"]')
        .find('button[data-action="last"]')
        .click();

      const lastPageStart = Math.floor((totalCount - 1) / 20) * 20 + 1;
      const lastPageEnd = totalCount;

      cy.get('[data-ouia-component-id="page-bottom"]')
        .contains(`${lastPageStart} - ${lastPageEnd} of ${totalCount}`)
        .should('exist');

      const expectedRows = lastPageEnd - lastPageStart + 1;
      cy.get('tbody tr')
        .not('.pf-v6-c-table__expandable-row')
        .should('have.length', expectedRows);
    }
  });
});

describe('expand all / collapse all', () => {
  beforeEach(() => {
    mountComponent();
  });

  it('expands all rows when expand all button is clicked', () => {
    cy.get('.pf-v6-c-table__expandable-row').should('not.be.visible');

    cy.get('button[aria-label="Expand all"]').click();

    cy.get('.pf-v6-c-table__expandable-row')
      .should('have.length', 20)
      .each(($row) => {
        cy.wrap($row).should('be.visible');
      });
  });

  it('collapses all rows when collapse all button is clicked', () => {
    cy.get('button[aria-label="Expand all"]').click();
    cy.get('.pf-v6-c-table__expandable-row').should('be.visible');

    cy.get('button[aria-label="Collapse all"]').click();

    cy.get('.pf-v6-c-table__expandable-row').should('not.be.visible');
  });

  it('expand all only affects current page', () => {
    cy.get('button[aria-label="Expand all"]').click();
    cy.get('.pf-v6-c-table__expandable-row').should('have.length', 20);

    cy.get('button[data-action="next"]').first().click();

    cy.get('.pf-v6-c-table__expandable-row').should('not.be.visible');
  });

  it('manually toggling individual row works after expand all', () => {
    cy.get('button[aria-label="Expand all"]').click();
    cy.get('.pf-v6-c-table__expandable-row').should('be.visible');

    cy.get('tbody button[aria-label="Details"]').first().click();

    cy.get('.pf-v6-c-table__expandable-row').first().should('not.be.visible');
    cy.get('.pf-v6-c-table__expandable-row').eq(1).should('be.visible');
  });
});

describe('URL parameter synchronization', () => {
  it('loads filters from URL parameters', () => {
    const urlParams = 'total_risk=4&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Total risk', 'Critical');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads pagination from URL parameters', () => {
    const urlParams = 'limit=10&offset=10';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    cy.contains('11 - 20 of 100').should('exist');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', 10);
  });

  it('loads search text from URL parameters', () => {
    const urlParams = 'text=ansible&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Name', 'ansible');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads multiple filters from URL parameters', () => {
    const urlParams = 'total_risk=4,3&category=1&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Important');
    hasChip('Category', 'Availability');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('updates URL when filters are applied', () => {
    mountComponentWithUrl('');
    cy.get(ROOT).should('be.visible');

    selectConditionalFilterOption('Total risk');
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();
    cy.get(MENU_ITEM).contains('Critical').click();
    cy.get(CONDITIONAL_FILTER).contains('Filter by total risk').click();

    cy.location('search').should('include', 'total_risk=4');
  });

  it('updates URL when pagination changes', () => {
    mountComponentWithUrl('');
    cy.get(ROOT).should('be.visible');

    cy.get('[class*="pf-v6-c-pagination"]')
      .find('button[class*="toggle"]')
      .first()
      .click();
    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('50').click();

    cy.location('search').should('include', 'limit=50');
    cy.location('search').should('include', 'offset=0');
  });

  it('updates URL when navigating to next page', () => {
    mountComponentWithUrl('limit=20&offset=0');
    cy.get(ROOT).should('be.visible');

    cy.get('button[data-action="next"]').first().click();

    cy.location('search').should('include', 'offset=20');
    cy.location('search').should('include', 'limit=20');
  });

  it('loads combined filters and pagination from URL', () => {
    const urlParams =
      'total_risk=4&text=kernel&limit=10&offset=0&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Total risk', 'Critical');
    hasChip('Name', 'kernel');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1)
      .and('have.length.at.most', 10);
  });

  it('loads category and impact filters from URL', () => {
    const urlParams = 'category=1&impact=4&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Category', 'Availability');
    hasChip('Impact', 'Critical');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads likelihood filter from URL', () => {
    const urlParams = 'likelihood=4&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Likelihood', 'Critical');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads risk of change filter from URL', () => {
    const urlParams = 'res_risk=4&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Risk of change', 'High');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads remediation type filter from URL', () => {
    const urlParams = 'has_playbook=true&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Remediation type', 'Ansible playbook');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('loads multiple risk filters and text search from URL', () => {
    const urlParams =
      'total_risk=3,4&impact=3,4&text=kernel&rule_status=enabled';
    mountComponentWithUrl(urlParams);
    cy.get(ROOT).should('be.visible');

    hasChip('Total risk', 'Critical');
    hasChip('Total risk', 'Important');
    hasChip('Impact', 'Critical');
    hasChip('Impact', 'High');
    hasChip('Name', 'kernel');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('updates URL when sorting is applied', () => {
    mountComponentWithUrl('');
    cy.get(ROOT).should('be.visible');

    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('th').contains('Total risk').click();
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');
  });

  it('maintains sort and filters together', () => {
    mountComponentWithUrl('');
    cy.get(ROOT).should('be.visible');

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

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });
});

describe('export functionality', () => {
  it('shows export button when exportConfig is provided', () => {
    const onSelectSpy = cy.spy().as('exportSpy');
    const exportConfig = {
      onSelect: onSelectSpy,
    };

    cy.mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Routes>
            <Route
              path="*"
              element={
                <NewRulesTable
                  rules={fixtures.data}
                  exportConfig={exportConfig}
                />
              }
            />
          </Routes>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('button[aria-label="Export"]').should('exist');
  });

  it('does not show export button when exportConfig is not provided', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Routes>
            <Route path="*" element={<NewRulesTable rules={fixtures.data} />} />
          </Routes>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('button[aria-label="Export"]').should('not.exist');
  });

  it('shows CSV and JSON export options in dropdown', () => {
    const onSelectSpy = cy.spy().as('exportSpy');
    const exportConfig = {
      onSelect: onSelectSpy,
    };

    cy.mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Routes>
            <Route
              path="*"
              element={
                <NewRulesTable
                  rules={fixtures.data}
                  exportConfig={exportConfig}
                />
              }
            />
          </Routes>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('button[aria-label="Export"]').click();

    cy.contains('Export to CSV').should('be.visible');

    cy.contains('Export to JSON').should('be.visible');
  });

  it('calls onSelect handler when CSV export is clicked', () => {
    const onSelectSpy = cy.spy().as('exportSpy');
    const exportConfig = {
      onSelect: onSelectSpy,
    };

    cy.mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Routes>
            <Route
              path="*"
              element={
                <NewRulesTable
                  rules={fixtures.data}
                  exportConfig={exportConfig}
                />
              }
            />
          </Routes>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('button[aria-label="Export"]').click();

    cy.contains('Export to CSV').click();

    cy.get('@exportSpy').should(
      'have.been.calledWith',
      Cypress.sinon.match.any,
      'csv',
    );
  });

  it('calls onSelect handler when JSON export is clicked', () => {
    const onSelectSpy = cy.spy().as('exportSpy');
    const exportConfig = {
      onSelect: onSelectSpy,
    };

    cy.mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Routes>
            <Route
              path="*"
              element={
                <NewRulesTable
                  rules={fixtures.data}
                  exportConfig={exportConfig}
                />
              }
            />
          </Routes>
        </IntlProvider>
      </MemoryRouter>,
    );

    cy.get('button[aria-label="Export"]').click();

    cy.contains('Export to JSON').click();

    cy.get('@exportSpy').should(
      'have.been.calledWith',
      Cypress.sinon.match.any,
      'json',
    );
  });
});

describe('Disable kebab recommendation', () => {
  it('is not rendered if isDisableRecEnabled is false', () => {
    mountComponent({ isDisableRecEnabled: false });
    cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
  });

  it('is rendered and enabled when isDisableRecEnabled is true', () => {
    mountComponent({ isDisableRecEnabled: true });
    cy.get('tbody tr')
      .first()
      .find('button[aria-label="Kebab toggle"]')
      .click();
    cy.contains('Disable recommendation').should('be.visible');
    cy.get('button[aria-label="Kebab toggle"]').should('exist');
  });
});

describe('ViewHostAcks modal', () => {
  const ruleWithHostAcks = {
    ...fixtures.data[0],
    hosts_acked_count: 5,
    impacted_systems_count: 10,
  };

  const ruleWithAllSystemsDisabled = {
    ...fixtures.data[1],
    hosts_acked_count: 3,
    impacted_systems_count: 0,
  };

  it('does not show "View systems" button when hosts_acked_count is 0', () => {
    mountComponent();
    cy.get('tbody tr').first().find('button[aria-label="Details"]').click();
    cy.get('button[data-ouia-component-id="viewSystem"]').should('not.exist');
  });

  it('shows "View systems" button when hosts_acked_count > 0', () => {
    const rulesWithAcks = [ruleWithHostAcks, ...fixtures.data.slice(1)];
    mountComponent({ rules: rulesWithAcks });
    cy.get('tbody tr').first().find('button[aria-label="Details"]').click();
    cy.get('button[data-ouia-component-id="viewSystem"]')
      .should('be.visible')
      .and('contain', 'View systems');
  });

  it('shows correct message when some systems are disabled', () => {
    const rulesWithAcks = [ruleWithHostAcks, ...fixtures.data.slice(1)];
    mountComponent({ rules: rulesWithAcks });
    cy.get('tbody tr').first().find('button[aria-label="Details"]').click();
    cy.get('.pf-v6-c-table__expandable-row-content')
      .first()
      .contains('Recommendation is disabled for 5 systems')
      .should('be.visible');
  });

  it('shows correct message when all systems are disabled', () => {
    const rulesWithAcks = [
      ruleWithAllSystemsDisabled,
      ...fixtures.data.slice(1),
    ];
    mountComponent({ rules: rulesWithAcks });
    cy.get('tbody tr').first().find('button[aria-label="Details"]').click();
    cy.get('.pf-v6-c-table__expandable-row-content')
      .first()
      .contains('Recommendation is disabled for all systems')
      .should('be.visible');
  });

  it('opens ViewHostAcks modal when "View systems" button is clicked', () => {
    const rulesWithAcks = [ruleWithHostAcks, ...fixtures.data.slice(1)];

    cy.intercept('GET', '**/hostack/**', {
      statusCode: 200,
      body: {
        data: [
          {
            id: '1',
            system_uuid: 'test-system-1',
            display_name: 'test-system-1.example.com',
            justification: 'Test justification',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
    }).as('getHostAcks');

    mountComponent({ rules: rulesWithAcks });
    cy.get('tbody tr').first().find('button[aria-label="Details"]').click();
    cy.get('button[data-ouia-component-id="viewSystem"]').click();
    cy.wait('@getHostAcks');
    cy.get('table[data-ouia-component-id="host-ack-table"]').should(
      'be.visible',
    );
    cy.contains('test-system-1.example.com').should('be.visible');
  });
});

describe('Debounced search', () => {
  it('debounces search input before applying filter', () => {
    mountComponent();

    cy.get('input[placeholder="Filter by name"]').type('kernel');

    cy.location('search').should('not.include', 'text=kernel');

    cy.wait(600);

    cy.location('search').should('include', 'text=kernel');

    cy.contains('kernel').should('be.visible');
  });

  it('shows typed text immediately in input (no lag)', () => {
    mountComponent();

    cy.get('input[placeholder="Filter by name"]').type('test');

    cy.get('input[placeholder="Filter by name"]').should('have.value', 'test');

    cy.location('search').should('not.include', 'text=test');
  });

  it('only applies filter once after rapid typing', () => {
    mountComponent();

    cy.get('input[placeholder="Filter by name"]').type('ker');
    cy.wait(100);
    cy.get('input[placeholder="Filter by name"]').type('nel');

    cy.wait(700);

    cy.location('search').should('include', 'text=kernel');

    cy.contains('.pf-v6-c-label-group__label', 'Name')
      .parent()
      .within(() => {
        cy.contains('kernel').should('exist');
      });
  });
});
