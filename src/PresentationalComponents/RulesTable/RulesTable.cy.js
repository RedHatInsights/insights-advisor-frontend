import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import _ from 'lodash';
import {
  rulesTableColumns,
  CATEGORIES,
} from '../../../cypress/support/globals';

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
  CHIP,
  changePagination,
  checkRowCounts,
  removeAllChips,
  applyFilters,
} from '@redhat-cloud-services/frontend-components-utilities';

//I'm looking at the https://docs.cypress.io/guides/component-testing/custom-mount-react#React-Router

import messages from '../../Messages';

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
const RISK_OF_CHANGE = { 'Very Low': 1, Low: 2, Moderate: 3, High: 4 };
const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const CATEGORIES_MAP = {
  Availability: 1,
  Security: 2,
  Stability: 3,
  Performance: 4,
};
const STATUS = ['All', 'Enabled', 'Disabled'];
const IMPACTING = { '1 or more': 'true', None: 'false' };
const INCIDENT = { Incident: 'true', 'Non-incident': 'false' };
const REMEDIATION = { 'Ansible playbook': true, Manual: false };
const REBOOT = { Required: true, 'Not required': false };

// missing: incidents, remediation, rebootRequired

//Filters configuration
const filtersConf = {
  name: {
    selectorText: 'Name',
    values: ['foobar'],
    type: 'input',
    filterFunc: (it, value) =>
      it.description.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'text',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  riskOfChange: {
    selectorText: 'Risk of change',
    values: Array.from(cumulativeCombinations(Object.keys(RISK_OF_CHANGE))),
    type: 'checkbox',
    urlParam: 'res_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => RISK_OF_CHANGE[x]).join(',')),
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
  incidents: {
    selectorText: 'Incidents',
    values: Array.from(cumulativeCombinations(Object.keys(INCIDENT))),
    type: 'checkbox',
    urlParam: 'incident',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => INCIDENT[x]).join(',')),
  },
  remediation: {
    selectorText: 'Remediation',
    values: Array.from(cumulativeCombinations(Object.keys(REMEDIATION))),
    type: 'checkbox',
    urlParam: 'has_playbook',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => REMEDIATION[x]).join(',')),
  },
  reboot: {
    selectorText: 'Reboot required',
    values: Array.from(cumulativeCombinations(Object.keys(REBOOT))),
    type: 'checkbox',
    urlParam: 'reboot',
    urlValue: (it) => encodeURIComponent(_.map(it, (x) => REBOOT[x]).join(',')),
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

//the default count is 20, you can pass the other number if you need to
const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(rulesTableColumns, (it) => it.title);
const ROOT = 'table[aria-label=rule-table]';

//Function I had to change to make the test work
//sorting doesn't work - need separate function that catches the API response

//TESTS//
describe('renders correctly', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    const store = getStore();

    cy.mount(
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

    cy.mount(
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

    cy.mount(
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
    checkPaginationTotal(fixtures.meta.count);
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
  //don't know how to make it work :(
  /* it('can iterate over pages', () => {
    cy.wrap(itemsPerPage(values.length)).each((el, index, list) => {
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

describe('filtering', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');

    const store = getStore();

    cy.mount(
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
    cy.get(CHIP_GROUP)
      .find(CHIP)
      .ouiaId('close', 'button')
      .each(() => {
        cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button').eq(0).click();
      });
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

  it('no filters show all recommendations', () => {
    removeAllChips();
    checkRowCounts(DEFAULT_ROW_COUNT);
    checkPaginationTotal(fixtures.meta.count);
  });

  describe('sends a request with correct parameters', () => {
    Object.entries(filtersConf).forEach(([key, config]) => {
      const { urlParam, values, urlValue, selectorText } = config;

      it(`apply ${selectorText} filter`, () => {
        // initial call
        cy.wait('@call');

        if (selectorText === filtersConf.impacting.selectorText) {
          removeAllChips();
          cy.wait(['@call', '@call']);
        }
        filterApply({ [key]: values[0] });
        cy.wait('@call')
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(values[0])}`);
      });
    });
  });
});
