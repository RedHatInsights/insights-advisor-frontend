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
  checkSorting,
  removeAllChips,
  applyFilters,
  filter,
  checkNoMatchingRecs,
  checkFiltering,
  TOOLBAR_FILTER,
  TITLE,
  TABLE
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
//function and filters config for testing filters
function* cumulativeCombinations(arr, current = []) {
  let i = 0;
  while (i < arr.length) {
    let next = current.concat(arr[i]);
    yield next;
    i++;
    const remaining = arr.slice(i);
    if (remaining.length) {
      yield* cumulativeCombinations(remaining, next);
    }
  }
}
const TOTAL_RISK = { Low: 1, Moderate: 2, Important: 3, Critical: 4 };
const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const CATEGORIES = {
  'Service Availability': ['service_availability'],
  Security: ['security'],
  'Fault Tolerance': ['fault_tolerance'],
  Performance: ['performance'],
};
const CATEGORIES_MAP = {
  'Service Availability': 1,
  Security: 4,
  'Fault Tolerance': 3,
  Performance: 2,
};
const STATUS = ['All', 'Enabled', 'Disabled'];
const IMPACTING = { '1 or more': 'true', None: 'false' };
//Filters configuration
const filtersConf = {
  name: {
    selectorText: 'Name',
    values: ['lorem', '1lorem', 'Not existing recommendation'],
    type: 'input',
    filterFunc: (it, value) =>
      it.description.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'text',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(Object.keys(TOTAL_RISK))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => TOTAL_RISK[x]).includes(it.total_risk),
    urlParam: 'total_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK[x]).join(',')),
  },
  impact: {
    selectorText: 'Impact',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACT))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => IMPACT[x]).includes(it.impact),
    urlParam: 'impact',
    urlValue: (it) => encodeURIComponent(_.map(it, (x) => IMPACT[x]).join(',')),
  },
  likelihood: {
    selectorText: 'Likelihood',
    values: Array.from(cumulativeCombinations(Object.keys(LIKELIHOOD))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => LIKELIHOOD[x]).includes(it.likelihood),
    urlParam: 'likelihood',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => LIKELIHOOD[x]).join(',')),
  },
  category: {
    selectorText: 'Category',
    values: Array.from(cumulativeCombinations(Object.keys(CATEGORIES))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.intersection(
        _.flatMap(value, (x) => CATEGORIES[x]),
        it.tags
      ).length > 0,
    urlParam: 'category',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => CATEGORIES_MAP[x]).join(',')),
  },
  status: {
    selectorText: 'Status',
    values: STATUS,
    type: 'radio',
    filterFunc: (it, value) => {
      if (value === 'All') return true;
      else return it.disabled === (value === 'Disabled');
    },
    urlParam: 'rule_status',
    urlValue: (it) => it.toLowerCase(),
  },
  impacting: {
    selectorText: 'Systems impacted',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACTING))),
    type: 'checkbox',
    filterFunc: (it, value) => {
      if (!value.includes('1 or more') && it.impacted_systems_count > 0)
        return false;
      if (!value.includes('None') && it.impacted_systems_count === 0)
        return false;
      return true;
    },
    urlParam: 'impacting',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => IMPACTING[x]).join(',')),
  },
};
const filterApply = (filters) => applyFilters(filters, filtersConf);
const filterCombos = [{ impacting: ['1 or more'] }];
const filterData = (filters = DEFAULT_FILTERS, values = data) =>
  filter(filtersConf, values, filters);

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
//the default count is 20, you can pass the other number if you need to
const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const DEFAULT_DISPLAYED_SIZE = Math.min(
  filterData(DEFAULT_FILTERS).length,
  DEFAULT_ROW_COUNT
);
const TABLE_HEADERS = _.map(columns, (it) => it.title);
const ROOT = 'table[aria-label=rule-table]';
const data = _.orderBy(
  fixtures,
  [(it) => it.updated_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);
let values = _.cloneDeep(fixtures['data']);
const dataUnsorted = _.cloneDeep(values);

//Function I had to change to make the test work
//sorting doesn't work - need separate function that catches the API response

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
  /* it(`shows maximum ${DEFAULT_ROW_COUNT} rules`, () => {
    checkRowCounts(DEFAULT_DISPLAYED_SIZE);
    expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
  }); */
  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
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
          `offset=${DEFAULT_ROW_COUNT * index}`
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
  //should be solved differently because RHEL Advisor utilize the API sorting
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
          DEFAULT_ROW_COUNT,
          label
        );
      });
    });
  }); */
});

describe('filtering', () => {
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
  it('can clear filters', () => {
    removeAllChips();
    // apply some filters
    filterApply(filterCombos[0]);
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(filterCombos[0]).length
    );
    cy.get(CHIP_GROUP).should('exist');
    // clear filters
    cy.get('button').contains('Reset filters').click();
    // check default filters
    hasChip('Systems impacted', '1 or more');
    hasChip('Status', 'Enabled');
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(DEFAULT_FILTERS).length
    );
    cy.get('button').contains('Reset filters').should('exist');
    checkRowCounts(DEFAULT_ROW_COUNT);
  });
  function checkEmptyState(title, checkIcon = false) {
    checkRowCounts(1);
    cy.get(TABLE)
      .ouiaId('empty-state')
      .should('have.length', 1)
      .within(() => {
        cy.get('.pf-c-empty-state__icon').should(
          'have.length',
          checkIcon ? 1 : 0
        );
        cy.get(`h5${TITLE}`).should('have.text', title);
      });
  }
  function checkNoMatchingRecs() {
    return checkEmptyState('No matching recommendations found');
  }
  it('empty state is displayed when filters do not match any rule', () => {
    removeAllChips();
    filterApply({
      name: 'Not existing recommendation',
    });
    checkNoMatchingRecs();
    checkTableHeaders(TABLE_HEADERS);
  });

  it('no filters show all recommendations', () => {
    removeAllChips();
    checkRowCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
    checkPaginationTotal(data.length);
  });

  describe('single filter', () => {
    Object.entries(filtersConf).forEach(([k, v]) => {
      v.values.forEach((filterValues) => {
        it(`${k}: ${filterValues}`, () => {
          // disabled recommendations have Disabled in their names
          let modifiedData = _.cloneDeep(data);
          modifiedData.forEach((it) => {
            if (it.disabled) {
              it.description = it.description + ' \nDisabled';
            }
          });
          const filters = { [k]: filterValues };
          checkFiltering(
            filters,
            filtersConf,
            _.map(filterData(filters, modifiedData), 'description').slice(
              0,
              DEFAULT_ROW_COUNT
            ),
            'Name',
            TABLE_HEADERS,
            'No matching recommendations found',
            true,
            true
          );
        });
      });
    });
  });

  // TODO: add more combinations
  describe('combined filters', () => {
    filterCombos.forEach((filters) => {
      it(`${Object.keys(filters)}`, () => {
        // disabled recommendations have Disabled in their names
        let modifiedData = _.cloneDeep(data);
        modifiedData.forEach((it) => {
          if (it.disabled) {
            it.description = it.description + ' \nDisabled';
          }
        });
        checkFiltering(
          filters,
          filtersConf,
          _.map(filterData(filters, modifiedData), 'description').slice(
            0,
            DEFAULT_ROW_COUNT
          ),
          'Name',
          TABLE_HEADERS,
          'No matching recommendations found',
          true,
          true
        );
      });
    });
  });

  it('clears text input after Name filter chip removal', () => {
    filterApply({ name: 'cc' });
    // remove the chip
    cy.contains(CHIP_GROUP, 'Name')
      .find('button')
      .click()
      .then(() => {
        expect(window.location.search).to.not.contain('text=');
      });
    cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').should('be.empty');
  });

  it('clears text input after resetting all filters', () => {
    filterApply({ name: 'cc' });
    // reset all filters
    cy.get(TOOLBAR)
      .find('button')
      .contains('Reset filters')
      .click()
      .then(() => {
        expect(window.location.search).to.not.contain('text=');
      });
    cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').should('be.empty');
  });
});
