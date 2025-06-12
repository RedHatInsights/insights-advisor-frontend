import _ from 'lodash';
import React from 'react';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import fixturesKcs from '../../../cypress/fixtures/kcs.json';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';

import {
  checkTableHeaders,
  CHIP_GROUP,
  CONDITIONAL_FILTER,
  hasChip,
  MENU_ITEM,
  PT_BULK_SELECT,
  PT_BULK_SELECT_LIST,
  SORTING_ORDERS,
  TABLE,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';
import {
  checkSorting,
  selectConditionalFilterOption,
} from '../../../cypress/utils/table';
import Wrapper from '../../Utilities/Wrapper';
import { INVENTORY_BASE_URL } from '../../AppConstants';
import systemProfile from '../../../cypress/fixtures/systemProfile.json';
import { selectRandomEnabledRows } from '../../../cypress/utils/table';
import messages from '../../Messages';

const TABLE_HEADERS = [
  'Description',
  'Modified',
  'First impacted',
  'Total risk',
  'Remediation type',
];
const ROOT = 'table[id=system-advisor-report-table]';
const SYSTEM_ID = '123';
const SYSTEM_INSIGHTS_ID = '456';

// const filtersConf = {
//   description: {
//     selectorText: 'Description',
//     type: 'input',
//   },
// }; // is not complete
//THIS FILE HAS COMMENTED OUT TEST BECAUSE THE FUNCTIONS/LABELS IMPORTED FROM FEC-UTILS
//NEED TO BE UPDATED

describe('system rules table', () => {
  beforeEach(() => {
    cy.intercept('/api/insights/v1/account_setting/', {
      statusCode: 200,
      body: {},
    });
    cy.intercept(`/api/insights/v1/system/${SYSTEM_ID}/reports/`, fixtures);
    cy.intercept('https://access.redhat.com/hydra/rest/search/kcs**', {
      response: {
        docs: fixturesKcs,
      },
    }).as('kcs');
    cy.intercept(
      `${INVENTORY_BASE_URL}/hosts/${SYSTEM_ID}/system_profile`,
      systemProfile.data,
    ).as('getSystemProfile');
    cy.mount(
      <Wrapper>
        <SystemAdvisor
          entity={{
            id: SYSTEM_ID,
            insights_id: SYSTEM_INSIGHTS_ID,
          }}
          inventoryId={SYSTEM_ID}
        />
      </Wrapper>,
    );
  });

  it('renders table', () => {
    cy.get(ROOT).should('have.length', 1);
    cy.get(TOOLBAR).should('have.length', 1);
    cy.get(TABLE).should('have.length', 1);
  });

  it('renders table headers', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  describe('sorting', () => {
    _.zip(
      [
        'rule.description',
        'rule.publish_date',
        'impacted_date',
        'rule.total_risk',
        'resolution.has_playbook',
      ],
      TABLE_HEADERS,
    ).forEach(([category, label]) => {
      let sortingParameter = category;
      // modify sortingParameters for certain values
      if (category === 'rule.created_at') {
        sortingParameter = (it) =>
          it.rule.created_at || '1970-01-01T01:00:00.001Z';
      } else if (category === 'impacted_date') {
        sortingParameter = (it) =>
          it.impacted_date || '1970-01-01T01:00:00.001Z';
      } else if (category == 'resolution.has_playbook') {
        sortingParameter = (it) => it.resolution.has_playbook || false;
      }

      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          checkSorting(
            _.orderBy(fixtures, ['rule.total_risk'], ['desc']), // sorted by total risk with first table render
            sortingParameter,
            label,
            order,
            'Description',
            'rule.description',
          );
        });
      });
    });
  });

  describe('Toolbar actions', () => {
    it('Should show remediation button when host is of type edge', () => {
      cy.get('.ins-c-primary-toolbar__first-action').contains('Remediation');
    });
    it('Should hide remediation button when host is of type edge', () => {
      systemProfile.data.results[0].system_profile.host_type = 'edge';

      cy.intercept(
        `${INVENTORY_BASE_URL}/hosts/${SYSTEM_ID}/system_profile`,
        systemProfile.data,
      ).as('getEdgeSystemProfile');

      cy.wait(['@getEdgeSystemProfile']);
      cy.get('.ins-c-primary-toolbar__first-action').should('not.exist');
    });
  });

  describe('Conditional Filter', () => {
    it(`Description filter box correctly updates chips.`, () => {
      // select Name filter
      selectConditionalFilterOption('Description');

      // enter a name
      // The ConditionalFilter ouiaId is assigned to the wrong element (input)
      cy.get('[aria-label="text input"]').click();
      cy.get('[aria-label="text input"]').type('Lorem');
      cy.get('[aria-label="text input"]').type('{enter}');

      // check chips updated
      hasChip('Description', 'Lorem');

      // reset
      cy.get('button').contains('Reset filters').click();

      // check chips empty
      cy.get(CHIP_GROUP).should('have.length', 0);
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

      // check chips empty
      cy.get(CHIP_GROUP).should('have.length', 0);
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

      // check chips empty
      cy.get(CHIP_GROUP).should('have.length', 0);
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

      // check chips empty
      cy.get(CHIP_GROUP).should('have.length', 0);
    });
  });

  describe('BulkSelector', () => {
    it(`The Bulk selector shows the correct number of systems selected.`, () => {
      // check that empty
      cy.get(PT_BULK_SELECT).should('have.text', '');

      // select a couple
      //  but only ones that can be selected
      cy.get('.pf-v5-c-table__tbody').then((rows) => {
        selectRandomEnabledRows({ rows: rows, numberOfRowsToSelect: 3 });
      });

      // check that it shows correct number
      cy.get(PT_BULK_SELECT).should('have.text', '3 selected');

      // Select None
      cy.get(
        ':nth-child(2) > .pf-v5-c-menu-toggle > .pf-v5-c-menu-toggle__controls',
      ).click();
      cy.get(PT_BULK_SELECT_LIST).contains('Select none').click();

      // check that none selected
      cy.get(PT_BULK_SELECT).should('have.text', '');

      // Select All
      cy.get(
        ':nth-child(2) > .pf-v5-c-menu-toggle > .pf-v5-c-menu-toggle__controls',
      ).click();
      cy.get(PT_BULK_SELECT_LIST).contains('Select all').click();

      // check that all selected
      cy.get(PT_BULK_SELECT).should('have.text', '7 selected');

      // click the BS
      cy.get(PT_BULK_SELECT).click();

      // check that none selected
      cy.get(PT_BULK_SELECT).should('have.text', '');

      // select some
      cy.get('.pf-v5-c-table__tbody').then((rows) => {
        selectRandomEnabledRows({ rows: rows, numberOfRowsToSelect: 3 });
      });

      // click the BS
      cy.get(PT_BULK_SELECT).click();

      // check that all selected
      cy.get(PT_BULK_SELECT).should('have.text', '7 selected');
    });
  });

  // it('renders "First impacted" date correctly', () => {
  //   const {
  //     rule: { description },
  //     impacted_date,
  //   } = fixtures[0];
  //   const date = dateStringByType('relative')(new Date(impacted_date));

  //   applyFilters({ description }, filtersConf);
  //   cy.get('td[data-label="First impacted"]').first().should('contain', date);
  // });

  it('request to kcs contains all required ids', () => {
    cy.wait('@kcs')
      .its('request.url')
      .should(
        'include',
        fixtures.map(({ rule }) => rule.node_id).join('%20OR%20'),
      );
  });

  describe(`Tooltips`, () => {
    function constructLikelihoodImpactTooltipContent(likelihood, impact) {
      return (
        messages.likelihoodDescription.defaultMessage.replace(
          /{(.*?)}/g,
          likelihood,
        ) +
        ' ' +
        messages.impactDescription.defaultMessage.replace(/{(.*?)}/g, impact)
      );
    }

    it(`Export kebab tooltip displays the correct content.`, () => {
      cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
      cy.contains(messages.permsAction.defaultMessage).should('be.visible');
    });

    it(`Critical tooltip displays the correct content.`, () => {
      cy.get('td[data-label="Total risk"] .pf-m-red')
        .first()
        .trigger('mouseenter');

      cy.contains(
        constructLikelihoodImpactTooltipContent('Low', 'Critical'),
      ).should('be.visible');
    });

    it(`Important tooltip displays the correct content.`, () => {
      cy.get('td[data-label="Total risk"] .pf-m-orange')
        .first()
        .trigger('mouseenter');
      cy.contains(
        constructLikelihoodImpactTooltipContent('Medium', 'Low'),
      ).should('be.visible');
    });

    it(`Moderate tooltip displays the correct content.`, () => {
      cy.get('td[data-label="Total risk"] .pf-m-gold')
        .first()
        .trigger('mouseenter');
      cy.contains(
        constructLikelihoodImpactTooltipContent('Medium', 'Medium'),
      ).should('be.visible');
    });

    it(`Low tooltip displays the correct content.`, () => {
      cy.get('td[data-label="Total risk"] .pf-m-blue')
        .first()
        .trigger('mouseenter');
      cy.contains(
        constructLikelihoodImpactTooltipContent('Medium', 'High'),
      ).should('be.visible');
    });
  });
});
// it('link to kcs has correct title and url', () => {
//   const {
//     rule: { description, node_id },
//   } = fixtures[0];
//   const kcsEntry = fixturesKcs.find(({ id }) => id === node_id);

//   applyFilters({ description }, filtersConf);
//   cy.ouiaId('ExpandCollapseAll').click();
//   cy.get('.ins-c-report-details__kba a')
//     .should('include.text', kcsEntry?.publishedTitle)
//     .should('have.attr', 'href', kcsEntry?.view_uri);
// });
