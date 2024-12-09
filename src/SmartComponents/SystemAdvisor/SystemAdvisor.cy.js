import _ from 'lodash';
import React from 'react';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import fixturesKcs from '../../../cypress/fixtures/kcs.json';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
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
  
  describe('BulkSelector', () => {
    function selectRandomEnabledRows({
      rows,
      numberOfRowsToSelect,
    }) {
      const enabledRows = Array.from(rows).filter(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if(!checkbox.hasAttribute('disabled')){
          return true;
        }
      })
      const rowCount = enabledRows.length

      const randomIndices = [];
      while (randomIndices.length < numberOfRowsToSelect) {
        const randomIndex = Math.floor(Math.random() * rowCount);
        if (!randomIndices.includes(randomIndex)) {
          randomIndices.push(randomIndex);
        }
      }

      randomIndices.forEach(index => {
        enabledRows[index].querySelector('input[type="checkbox"]').click();
      });
    }

    it(`The Bulk selector shows the correct number of systems selected.`, () => {
      
      // check that empty
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '')
      
      // select a couple
      //  but only ones that can be selected
      cy.get('.pf-v5-c-table__tbody').then(rows => {selectRandomEnabledRows({rows: rows, numberOfRowsToSelect: 3})});
      
      // check that it shows correct number
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '3 selected')

      // Select None
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle > .pf-v5-c-menu-toggle__controls').click();
      cy.get('[data-ouia-component-id="BulkSelectList-0"] > .pf-v5-c-menu__item > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click()

      // check that none selected
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '')

      // Select All
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle > .pf-v5-c-menu-toggle__controls').click();
      cy.get('[data-ouia-component-id="BulkSelectList-1"] > .pf-v5-c-menu__item > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click()

      // check that all selected
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '7 selected')

      // click the BS
      cy.get('[data-ouia-component-id="BulkSelect"').click();

      // check that none selected
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '')

      // select some
      cy.get('.pf-v5-c-table__tbody').then(rows => {selectRandomEnabledRows({rows: rows, numberOfRowsToSelect: 3})});

      // click the BS
      cy.get('[data-ouia-component-id="BulkSelect"').click();

      // check that all selected
      cy.get(':nth-child(2) > .pf-v5-c-menu-toggle').should('have.text', '7 selected')
    });
  });
});
