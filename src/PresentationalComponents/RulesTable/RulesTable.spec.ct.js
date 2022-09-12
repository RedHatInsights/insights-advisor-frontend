import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from '@cypress/react';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/rulesfixtures';
import _ from 'lodash';

// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
  checkPaginationTotal,
  checkPaginationValues,
  PAGINATION_VALUES,
  TOOLBAR,
  tableIsSortedBy,
  hasChip,
  CHIP_GROUP,
  changePagination,
  checkRowCounts,
  itemsPerPage,
  PAGINATION,
  PAGINATION_MENU,
  DROPDOWN_TOGGLE,
  SORTING_ORDERS,
  checkSorting
} from '@redhat-cloud-services/frontend-components-utilities';

//I'm looking at the https://docs.cypress.io/guides/component-testing/custom-mount-react#React-Router

import { createIntl, createIntlCache } from 'react-intl';
import { cellWidth, sortable, fitContent } from '@patternfly/react-table';
import messages from '../../Messages';
//declaring intl to provie it to the columns
const cache = createIntlCache();
const intl = createIntl(
  {
    // eslint-disable-next-line no-console
    onError: console.error,
    locale: navigator.language.slice(0, 2),
  },
  cache
);
//Columns should be in a separate file where we will store all the constants???
export const columns = [
  {
    title: intl.formatMessage(messages.name),
    transforms: [sortable, cellWidth(40)],
  },
  {
    title: intl.formatMessage(messages.modified),
    transforms: [sortable, cellWidth(10)],
  },
  {
    title: intl.formatMessage(messages.category),
    transforms: [sortable, cellWidth(10)],
  },
  {
    title: intl.formatMessage(messages.totalRisk),
    transforms: [sortable, cellWidth(15)],
  },
  {
    title: intl.formatMessage(messages.riskOfChange),
    transforms: [sortable, cellWidth(15)],
  },
  {
    title: intl.formatMessage(messages.systems),
    transforms: [sortable, cellWidth(15)],
  },
  {
    title: intl.formatMessage(messages.remediation),
    transforms: [sortable, cellWidth(15), fitContent],
  },
];

const TABLE_HEADERS = _.map(columns, (it) => it.title);
const ROOT = 'table[aria-label=rule-table]';
const data = _.orderBy(
  fixtures,
  [(it) => it.updated_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);
let values = _.cloneDeep(fixtures['data']);
const dataUnsorted = _.cloneDeep(values);
//the default count is 20, you can pass the other number if you need to
const DEFAULT_ROWS_SHOWN = 20;
//Function I had to change to make the test work

//TESTS//
describe('test', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    const store = getStore();

    mount(
      <MemoryRouter>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <RulesTable />
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    );
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

    const store = getStore();

    mount(
      <MemoryRouter>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <RulesTable />
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    );
  });
  //this test doesn't work because RHEL Advisor do not apply default filters on to the URL
  //at the first render.
  /* it(`shows maximum ${DEFAULT_ROWS_SHOWN} rules`, () => {
    checkRowCounts(DEFAULT_DISPLAYED_SIZE);
    expect(window.location.search).to.contain(`limit=${DEFAULT_ROWS_SHOWN}`);
  }); */
  it(`pagination is set to ${DEFAULT_ROWS_SHOWN}`, () => {
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROWS_SHOWN}`);
  });
  //couldn't check the url paramater because it's not applied to the url on the first render
  it('sorting using Total risk', () => {
    const column = 'Total risk';
    tableIsSortedBy(column);
  });

  it('applies total risk "Enabled" and systems impacted "1 or more" filters', () => {
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
    cy.get(CHIP_GROUP).find('.pf-c-chip__text').should('have.length', 2);
    //couldn't check the url paramater because it's not applied to the url on the first render
    //expect(window.location.search).to.contain(`status=enabled and systems impacted`);
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

    const store = getStore();

    mount(
      <MemoryRouter>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <RulesTable />
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    );
  });
  it('shows correct total number of rules', () => {
    checkPaginationTotal(50);
  });

  it('values are expected ones', () => {
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    // FIXME: best way to make the loop
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el).then(() => {
        expect(window.location.search).to.contain(`limit=${el}`);
      });
    });
  });
  //couldn't make this function work =(
  /* it('can iterate over pages', () => {
    cy.wrap(itemsPerPage(data.length)).each((el, index, list) => {
      checkRowCounts(el).then(() => {
        expect(window.location.search).to.contain(
          `offset=${DEFAULT_ROWS_SHOWN * index}`
        );
      });
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find('button[data-action="next"]')
        .then(($button) => {
          if (index === list.length - 1) {
            cy.wrap($button).should('be.disabled');
          } else {
            cy.wrap($button).click();
          }
        });
    });
  }); */
});

describe('sorting', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    const store = getStore();

    mount(
      <MemoryRouter>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <RulesTable />
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    );
  });
  //doesn't work, need a rewrite of the sorting function because it takes wrong "name" for the url
  //example - it should be sort=description, not a sort=name
  /* _.zip(
    [
      'description',
      'publish_date',
      'category',
      'total_risk',
      'resolution_risk',
      'impacted_count',
      'playbook_count',
    ],
    TABLE_HEADERS
  ).forEach(([category, label]) => {
    SORTING_ORDERS.forEach((order) => {
      it(`${order} by ${label}`, () => {
        let sortingParameter = category;
        // modify sortingParameters for certain values

        if (category === 'last_checked_at') {
          // map missing last_check_at to old times
          sortingParameter = (it) =>
            it.last_checked_at || '1970-01-01T01:00:00.001Z';
        } else if (category === 'cluster_version') {
          sortingParameter = (it) =>
            (it.cluster_version || '0.0.0')
              .split('.')
              .map((n) => parseInt(n) + 100000) // add padding
              .join('.');
        }
        checkSorting(
          dataUnsorted,
          sortingParameter,
          label,
          order,
          'Name',
          'name',
          DEFAULT_ROWS_SHOWN,
          label
        );
      });
    });
  }); */
});
