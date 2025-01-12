import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import PathwaysTable from './PathwaysTable';
import fixtures from '../../../cypress/fixtures/pathways.json';
import { pathwaysTableColumns } from '../../../cypress/support/globals';
import _ from 'lodash';

// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  TOOLBAR,
  checkTableHeaders,
  tableIsSortedBy,
  // checkPaginationTotal,
  // checkPaginationValues,
  // changePagination,
  // PAGINATION_VALUES,
  SORTING_ORDERS,
} from '@redhat-cloud-services/frontend-components-utilities';

const ROOT = 'table[aria-label="pathways-table"]';
const TABLE_HEADERS = _.map(pathwaysTableColumns, (it) => it.title);
const ROWS_SHOWN = fixtures.data.length;
const CATEGORY_VALUES = [
  'Availability',
  'Performance',
  'Stability',
  'Security',
];

//THIS FILE HAS COMMENTED OUT TEST BECAUSE THE FUNCTIONS/LABELS IMPORTED FROM FEC-UTILS
//NEED TO BE UPDATED

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
    </MemoryRouter>
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
      cy.get('.pf-v5-c-menu-toggle__text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${ROWS_SHOWN}`);
    });
    //couldn't check the url paramater because it's not applied to the url on the first render
    it('sorting using Recommendation level', () => {
      tableIsSortedBy('Recommendation level');
    });
  });
  //The imported data-ouia-component-type="PF5/PaginationOptionsMenu isnt wants on the menu. Need to update FEC-utils
  // describe('pagination', () => {
  //   it('shows correct total number of pathways', () => {
  //     checkPaginationTotal(fixtures.meta.count);
  //   });

  //   it('values are expected ones', () => {
  //     checkPaginationValues(PAGINATION_VALUES);
  //   });

  //   it('can change page limit', () => {
  //     // FIXME: best way to make the loop
  //     cy.wrap(PAGINATION_VALUES).each((el) => {
  //       changePagination(el).then(() => {
  //         expect(window.location.search).to.contain(`limit=${el}`);
  //       });
  //     });
  //   });
  // });
  describe('Sorting', () => {
    function checkSortingUrl(label, order, dataField) {
      // get appropriate locators
      const header = `th[data-label="${label}"]`;
      // sort by column and verify URL
      if (order === 'ascending') {
        cy.get(header).find('button').eq(0).click();
        cy.url().should('include', `sort=${dataField}`);
      } else {
        cy.get(header).find('button').eq(0).click();
        cy.wait(['@call', '@call']);
        cy.get(header).find('button').eq(0).click();
        cy.url().should('include', `sort=-${dataField}`);
      }
    }

    _.zip(
      ['name', 'impacted_systems_count', 'recommendation_level'],
      ['Name', 'Systems', 'Recommendation level']
    ).forEach(([category, label]) => {
      let sortingParameter = category;
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          checkSortingUrl(label, order, sortingParameter);
        });
      });
    });
  });

  describe('Multiple categories get abbreviated', () => {
    it('Multiple categories get abbreviated', () => {
      // for each row
      cy.get('tbody [data-ouia-component-type="PF5/TableRow"]').then((rows) => {
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
});
