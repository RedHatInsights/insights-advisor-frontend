import _ from 'lodash';
import React from 'react';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import fixturesKcs from '../../../cypress/fixtures/kcs.json';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
  CHIP_GROUP,
  CONDITIONAL_FILTER,
  CONDITIONAL_FILTER_TOGGLE,
  hasChip,
  MENU_ITEM,
  PT_CONDITIONAL_FILTER_LIST,
  SORTING_ORDERS,
  TABLE,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';
import { checkSorting } from '../../../cypress/utils/table';
import Wrapper from '../../Utilities/Wrapper';
import { INVENTORY_BASE_URL } from '../../AppConstants';
import systemProfile from '../../../cypress/fixtures/systemProfile.json';

const TABLE_HEADERS = [
  'Description',
  'Modified',
  'First impacted',
  'Total risk',
  'Remediation',
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

/*eslint-disable camelcase*/
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
      systemProfile.data
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
      </Wrapper>
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
        fixtures.map(({ rule }) => rule.node_id).join('%20OR%20')
      );
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

  describe('sorting', () => {
    _.zip(
      [
        'rule.description',
        'rule.publish_date',
        'impacted_date',
        'rule.total_risk',
        'resolution.has_playbook',
      ],
      TABLE_HEADERS
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
            'rule.description'
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
        systemProfile.data
      ).as('getEdgeSystemProfile');

      cy.wait(['@getEdgeSystemProfile']);
      cy.get('.ins-c-primary-toolbar__first-action').should('not.exist');
    });
  });

  describe('Conditional Filter', () => {
    it(`Description filter box correctly updates chips.`, () => {
      // select Name filter
      cy.get(CONDITIONAL_FILTER_TOGGLE).click();
      cy.get(PT_CONDITIONAL_FILTER_LIST).contains('Description').click();

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
      cy.get(CONDITIONAL_FILTER_TOGGLE).click();
      cy.get(PT_CONDITIONAL_FILTER_LIST).contains('Total risk').click();

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
      cy.get(CONDITIONAL_FILTER_TOGGLE).click();
      cy.get(PT_CONDITIONAL_FILTER_LIST).contains('Category').click();

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
      cy.get(CONDITIONAL_FILTER_TOGGLE).click();
      cy.get(PT_CONDITIONAL_FILTER_LIST).contains('Remediation').click();

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
});
