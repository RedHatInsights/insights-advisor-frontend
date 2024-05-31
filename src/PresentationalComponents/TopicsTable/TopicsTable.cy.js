import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/topics.json';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
  tableIsSortedBy,
  CHIP_GROUP,
  CHIP,
  SORTING_ORDERS,
} from '@redhat-cloud-services/frontend-components-utilities';
import { topicsTableColumns } from '../../../cypress/support/globals';
import _ from 'lodash';
import TopicsTable from './TopicsTable';

const TABLE_HEADERS = _.map(topicsTableColumns, (it) => it.title);
const filterCombos = [{ name: ['HTTP'] }];

const mountComponent = () => {
  cy.mount(
    <MemoryRouter>
      <IntlProvider>
        <Provider store={initStore()}>
          <Routes>
            <Route
              key={'Topics'}
              path="*"
              element={
                <TopicsTable
                  props={{
                    data: fixtures,
                    isLoading: false,
                    isFetching: false,
                    isError: false,
                  }}
                />
              }
            />
          </Routes>
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('renders correctly', () => {
  beforeEach(() => {
    mountComponent();
  });

  it('The Topics table renders', () => {
    cy.get('table').should('have.length', 1);
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('links to the topic detail page', () => {
    cy.get('tbody tr:first [data-label=Name] a')
      .should('have.attr', 'href')
      .and('include', `/topics/${fixtures[0].slug}`);
    cy.get('tbody tr:first [data-label="Affected systems"] a')
      .should('have.attr', 'href')
      .and('include', `/topics/${fixtures[0].slug}`);
  });
});

describe('defaults', () => {
  beforeEach(() => {
    mountComponent();
  });
  it('sorting using Featured', () => {
    const column = 'Featured';
    tableIsSortedBy(column);
  });
});

describe('filtering', () => {
  beforeEach(() => {
    mountComponent();
  });
  it('can clear filters', () => {
    cy.get('div.ins-c-primary-toolbar__filter').find('input').type('HTTP');
    cy.get(CHIP_GROUP)
      .find(CHIP)
      .ouiaId('close', 'button')
      .each(() => {
        cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button').eq(0).click();
      });
  });

  it('can add filters', () => {
    cy.get('div.ins-c-primary-toolbar__filter').find('input').type('HTTP');
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(filterCombos[0]).length
    );
  });
});

describe('sorting', () => {
  function topicsSorting({
    data,
    sortingField,
    label,
    order,
    columnField,
    dataField,
  }) {
    const header = `th[data-label="${label}"]`;

    if (order === 'ascending') {
      cy.get(header).find('button').click();
    } else {
      // eslint-disable-next-line cypress/unsafe-to-chain-command
      cy.get(header).find('button').click().click();
    }

    let sortedValues = _.map(
      _.orderBy(
        data,
        [sortingField],
        [order === 'descending' ? 'desc' : 'asc']
      ),
      dataField
    );

    cy.get(`td[data-label="${columnField}"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', sortedValues);
  }
  beforeEach(() => {
    mountComponent();
  });
  _.zip(['name', 'featured', 'impacted_systems_count'], TABLE_HEADERS).forEach(
    ([category, label]) => {
      let sortingParameter = category;

      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          topicsSorting({
            data: fixtures,
            sortingField: sortingParameter,
            label: label,
            order: order,
            columnField: 'Name',
            dataField: 'name',
          });
        });
      });
    }
  );
});
