import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/topics.json';

import {
  checkTableHeaders,
  CHIP_GROUP,
  SORTING_ORDERS,
} from '@redhat-cloud-services/frontend-components-utilities';
import { topicsTableColumns } from '../../../cypress/support/globals';
import _ from 'lodash';
import TopicsTable from './TopicsTable';
import { removeAllFilterChipsPf6 } from '../../../cypress/utils/table';
import { featureFlagInterceptor } from '../../../cypress/support/interceptors';
import FlagProvider from '@unleash/proxy-client-react';

const TABLE_HEADERS = _.map(topicsTableColumns, (it) => it.title);
const filterCombos = [{ name: ['HTTP'] }];

const mountComponent = (enableTableTools = false) => {
  if (enableTableTools) {
    featureFlagInterceptor(['advisor-tabletools-migration']);
  } else {
    featureFlagInterceptor([]);
  }

  cy.mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
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
    </FlagProvider>,
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
    cy.tableIsSortedBy(column);
  });
});

describe('filtering', () => {
  beforeEach(() => {
    mountComponent();
  });
  it('can clear filters', () => {
    cy.get('div.ins-c-primary-toolbar__filter').find('input').type('HTTP');
    removeAllFilterChipsPf6();
  });

  it('can add filters', () => {
    cy.get('div.ins-c-primary-toolbar__filter').find('input').type('HTTP');
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(filterCombos[0]).length,
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
        [order === 'descending' ? 'desc' : 'asc'],
      ),
      dataField,
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
    },
  );
});

describe('feature flag toggle', () => {
  it('renders with tabletools when feature flag is enabled', () => {
    mountComponent(true);
    cy.get('table').should('have.length', 1);
    cy.contains('Gambezon').should('be.visible');
    cy.contains('HTTP').should('be.visible');
  });

  it('renders original implementation when feature flag is disabled', () => {
    mountComponent(false);
    cy.get('table').should('have.length', 1);
    cy.contains('Gambezon').should('be.visible');
    cy.contains('HTTP').should('be.visible');
  });
});

describe('renders correctly (with tabletools)', () => {
  beforeEach(() => {
    mountComponent(true);
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

describe('defaults (with tabletools)', () => {
  beforeEach(() => {
    mountComponent(true);
  });
  it('sorting using Featured', () => {
    const column = 'Featured';
    cy.tableIsSortedBy(column);
  });
});

describe('filtering (with tabletools)', () => {
  beforeEach(() => {
    mountComponent(true);
  });
  it('renders filter input', () => {
    cy.get('input[placeholder="Filter by name"]').should('exist');
  });
});

describe('sorting (with tabletools)', () => {
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
      cy.get(header).find('button').click();
      cy.get(header).find('button').click();
    }

    let sortedValues = _.map(
      _.orderBy(
        data,
        [sortingField],
        [order === 'descending' ? 'desc' : 'asc'],
      ),
      (item) => String(item[dataField]).trim(),
    );

    cy.get(`td[data-label="${columnField}"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), (el) => el.innerText.trim());
      })
      .then((actualValues) => {
        console.log('Expected:', sortedValues);
        console.log('Actual:', actualValues);
        expect(actualValues).to.deep.equal(sortedValues);
      });
  }
  beforeEach(() => {
    mountComponent(true);
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
    },
  );
});
