import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import PathwaysTable from './PathwaysTable';
import fixtures from '../../../cypress/fixtures/pathways.json';
import { pathwaysTableColumns } from '../../../cypress/support/globals';
import _ from 'lodash';
import { selectConditionalFilterOption } from '../../../cypress/utils/table';

import {
  hasChip,
  CONDITIONAL_FILTER,
  MENU_ITEM,
} from '@redhat-cloud-services/frontend-components-utilities';

import {
  TOOLBAR,
  checkTableHeaders,
} from '@redhat-cloud-services/frontend-components-utilities';

const ROOT = 'table[aria-label="pathways-table"]';
const TABLE_HEADERS = _.map(pathwaysTableColumns, (it) => it.title);
const ROWS_SHOWN = 20;
const CATEGORY_VALUES = [
  'Availability',
  'Performance',
  'Stability',
  'Security',
];

const mountComponent = () => {
  let activeTab = 1;
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0, 2)}>
        <Provider store={initStore()}>
          <Routes>
            <Route
              key={'Recommendations Pathways'}
              path="*"
              element={<PathwaysTable isTabActive={activeTab} />}
            />
          </Routes>
        </Provider>
      </IntlProvider>
    </MemoryRouter>,
  );
};

describe('Pathways table tests', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 200,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });

  describe('defaults', () => {
    it('The Pathways table renders', () => {
      cy.get(ROOT).should('have.length', 1);
    });
    it('renders toolbar', () => {
      cy.get(TOOLBAR).should('have.length', 1);
    });
    it('renders table header', () => {
      checkTableHeaders(TABLE_HEADERS);
    });
    it('links to the pathway detail page', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('tbody tr:first [data-label=Name] a')
        .should('have.attr', 'href')
        .and('include', `/recommendations/pathways/${fixtures.data[0].slug}`);
      cy.get('tbody tr:first [data-label=Systems] a')
        .should('have.attr', 'href')
        .and('include', `/recommendations/pathways/${fixtures.data[0].slug}`);
    });
  });

  describe('defaults', () => {
    it(`The amount of rows shown is ${ROWS_SHOWN}`, () => {
      cy.get('.pf-v6-c-menu-toggle__text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${ROWS_SHOWN}`);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
    });

    it('sorts by Name in ascending order', () => {
      cy.get('th').contains('Name').click();

      cy.get('th')
        .contains('Name')
        .closest('th')
        .should('have.attr', 'aria-sort', 'ascending');

      cy.url().should('include', 'sort=name');
    });

    it('sorts by Name in descending order', () => {
      cy.get('th').contains('Name').click();
      cy.wait('@call');
      cy.get('th').contains('Name').click();

      cy.get('th')
        .contains('Name')
        .closest('th')
        .should('have.attr', 'aria-sort', 'descending');

      cy.url().should('include', 'sort=-name');
    });

    it('sorts by Systems in ascending order', () => {
      cy.get('th').contains('Systems').click();

      cy.get('th')
        .contains('Systems')
        .closest('th')
        .should('have.attr', 'aria-sort', 'ascending');

      cy.url().should('include', 'sort=impacted_systems_count');
    });

    it('sorts by Systems in descending order', () => {
      cy.get('th').contains('Systems').click();
      cy.wait('@call');
      cy.get('th').contains('Systems').click();

      cy.get('th')
        .contains('Systems')
        .closest('th')
        .should('have.attr', 'aria-sort', 'descending');

      cy.url().should('include', 'sort=-impacted_systems_count');
    });

    it('sorts by Recommendation level in ascending order', () => {
      cy.get('th').contains('Recommendation level').click();

      cy.get('th')
        .contains('Recommendation level')
        .closest('th')
        .should('have.attr', 'aria-sort', 'ascending');

      cy.url().should('include', 'sort=recommendation_level');
    });

    it('sorts by Recommendation level in descending order', () => {
      // Click the sort button specifically (not the info button)
      cy.get('th')
        .contains('Recommendation level')
        .closest('th')
        .find('button.pf-v6-c-table__button')
        .click({ force: true });
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

      cy.get('th')
        .contains('Recommendation level')
        .closest('th')
        .find('button.pf-v6-c-table__button')
        .click({ force: true });
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

      cy.get('th')
        .contains('Recommendation level')
        .closest('th')
        .should('have.attr', 'aria-sort', 'descending');

      cy.url().should('include', 'sort=-recommendation_level');
    });
  });

  describe('Conditional Filter', () => {
    it(`Name filter box correctly updates chips.`, () => {
      // select Name filter
      selectConditionalFilterOption('Name');

      // enter a name
      // The ConditionalFilter ouiaId is assigned to the wrong element (input)
      cy.get('[aria-label="text input"]').click();
      cy.get('[aria-label="text input"]').type('Lorem');

      // check chips updated
      hasChip('Name', 'Lorem');

      // reset
      cy.get('button').contains('Reset filters').click();

      // check chips empty - use PF6 ChipGroup selector to avoid category labels
      cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
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

      // check chips empty - use PF6 ChipGroup selector to avoid category labels
      cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
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

      // check chips empty - use PF6 ChipGroup selector to avoid category labels
      cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
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

      // check chips empty - use PF6 ChipGroup selector to avoid category labels
      cy.get('[data-ouia-component-type="PF6/ChipGroup"]').should('not.exist');
    });
  });

  describe('Tooltips', () => {
    beforeEach(() => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
    });

    it(`Recommendation level tooltip displays the correct content.`, () => {
      cy.get('.pf-v6-c-table__column-help-action').trigger('mouseenter');
      cy.contains(
        "Indicates a recommendation's urgency on a scale of high (fix immediately) to low (fix when convenient)",
      ).should('be.visible');
    });

    it(`Incident tooltip displays the correct content.`, () => {
      cy.get('.adv-c-label-incident').first().trigger('mouseenter');
      cy.contains(
        'Indicates configurations that are currently affecting your systems',
      ).should('be.visible');
    });
  });

  describe('Multiple categories get abbreviated', () => {
    it('Multiple categories get abbreviated', () => {
      // for each row
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('tbody [data-ouia-component-type="PF6/TableRow"]').then((rows) => {
        Array.from(rows).forEach((row) => {
          cy.wrap(row)
            .find('td[data-label="Category"] li')
            .then((elems) => {
              expect(elems[0].textContent.trim()).to.be.oneOf(CATEGORY_VALUES);
              if (elems.length > 1) {
                expect(elems[1].textContent.trim()).to.match(/more$/);
              }
            });
        });
      });
    });
  });

  describe('table structure', () => {
    it('renders table with correct ARIA label', () => {
      cy.get(ROOT).should('have.attr', 'aria-label', 'pathways-table');
    });

    it('renders table with compact variant', () => {
      cy.get(ROOT).should('have.attr', 'class').and('include', 'compact');
    });

    it('displays correct number of table columns', () => {
      cy.get('thead th').should('have.length', 5);
    });
  });

  describe('content display', () => {
    it('displays the first pathway from fixtures', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      const firstPathway = fixtures.data[0];
      cy.contains('td', firstPathway.name).should('exist');
    });

    fixtures.data.slice(0, 5).forEach((pathway, index) => {
      it(`displays pathway ${index + 1}: "${pathway.name}"`, () => {
        cy.wait('@call');
        cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
        cy.contains('td', pathway.name).should('exist');

        if (pathway.categories?.length > 0) {
          cy.get('tbody tr')
            .eq(index)
            .find('td[data-label="Category"] .pf-v6-c-label')
            .should('exist');
        }

        cy.contains(
          'td',
          pathway.impacted_systems_count.toLocaleString(),
        ).should('exist');
      });
    });
  });

  describe('category labels display', () => {
    it('displays CategoryLabel component', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('td[data-label="Category"]')
        .first()
        .find('.pf-v6-c-label')
        .should('exist');
    });

    it('displays category labels with correct styling', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('td[data-label="Category"] .pf-v6-c-label').should('exist');
    });

    fixtures.data.slice(0, 3).forEach((pathway, index) => {
      it(`displays category label for pathway ${index + 1}`, () => {
        cy.wait('@call');
        cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
        if (pathway.categories?.length > 0) {
          cy.get('tbody tr')
            .eq(index)
            .find('td[data-label="Category"] .pf-v6-c-label')
            .should('exist');
        }
      });
    });
  });

  describe('systems count display', () => {
    it('displays systems count as clickable link', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('td[data-label="Systems"] a').should('exist');
    });

    it('displays correct systems count for each pathway', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      fixtures.data.slice(0, 3).forEach((pathway, index) => {
        cy.get('tbody tr')
          .eq(index)
          .find('td[data-label="Systems"]')
          .should('contain', pathway.impacted_systems_count.toLocaleString());
      });
    });
  });

  describe('reboot status display', () => {
    it('displays reboot status for all pathways', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('td[data-label="Reboot"]').should(
        'have.length',
        fixtures.data.length,
      );
    });

    it('displays reboot required status correctly', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      const pathwayRequiringReboot = fixtures.data.find(
        (p) => p.reboot_required === true,
      );
      if (pathwayRequiringReboot) {
        cy.contains('td', 'Required').should('exist');
      }
    });

    it('displays not required status correctly', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      const pathwayNotRequiringReboot = fixtures.data.find(
        (p) => p.reboot_required === false,
      );
      if (pathwayNotRequiringReboot) {
        cy.contains('td', 'Not required').should('exist');
      }
    });
  });

  describe('recommendation level display', () => {
    it('displays RecommendationLevel component', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('td[data-label="Recommendation level"]')
        .first()
        .find('.pf-v6-c-label')
        .should('exist');
    });

    it('displays recommendation level for all pathways', () => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      // Verify each row has exactly one recommendation level label
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Recommendation level"] .pf-v6-c-label')
          .should('have.length', 1);
      });
    });

    fixtures.data.slice(0, 3).forEach((pathway, index) => {
      it(`displays recommendation level for pathway ${index + 1} (level: ${pathway.recommendation_level})`, () => {
        cy.wait('@call');
        cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
        cy.get('tbody tr')
          .eq(index)
          .find('td[data-label="Recommendation level"] .pf-v6-c-label')
          .should('exist');
      });
    });
  });

  describe('incident labels display', () => {
    it('displays incident label when has_incident is true', () => {
      const pathwayWithIncident = fixtures.data.find(
        (p) => p.has_incident === true,
      );
      if (pathwayWithIncident) {
        cy.wait('@call');
        cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
        cy.get('td[data-label="Name"]')
          .find('.pf-v6-c-label')
          .contains('Incident')
          .should('exist');
      }
    });

    it('incident label has correct color', () => {
      const pathwayWithIncident = fixtures.data.find(
        (p) => p.has_incident === true,
      );
      if (pathwayWithIncident) {
        cy.wait('@call');
        cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
        cy.get('td[data-label="Name"] .pf-v6-c-label').should(
          'have.class',
          'pf-m-red',
        );
      }
    });
  });

  describe('data attributes', () => {
    beforeEach(() => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
    });

    it('has data-label attribute on Name column', () => {
      cy.get('tbody td[data-label="Name"]').should('exist');
    });

    it('has data-label attribute on Category column', () => {
      cy.get('tbody td[data-label="Category"]').should('exist');
    });

    it('has data-label attribute on Systems column', () => {
      cy.get('tbody td[data-label="Systems"]').should('exist');
    });

    it('has data-label attribute on Reboot column', () => {
      cy.get('tbody td[data-label="Reboot"]').should('exist');
    });

    it('has data-label attribute on Recommendation level column', () => {
      cy.get('tbody td[data-label="Recommendation level"]').should('exist');
    });
  });

  describe('responsive behavior', () => {
    beforeEach(() => {
      cy.wait('@call');
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
    });

    it('renders with compact variant for mobile', () => {
      cy.get(ROOT).should('have.class', 'pf-m-compact');
    });

    it('all cells have data-label for responsive stacking', () => {
      cy.get('tbody td[data-label]').should('have.length.at.least', 5);
    });
  });
});
