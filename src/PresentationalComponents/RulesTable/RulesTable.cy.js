import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

//eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
  TOOLBAR,
  tableIsSortedBy,
  hasChip,
  CHIP_GROUP,
  SORTING_ORDERS,
  changePagination,
  PAGINATION_VALUES,
  checkPaginationValues,
  checkPaginationTotal,
  CHIP,
  checkRowCounts,
  removeAllChips,
  CONDITIONAL_FILTER,
} from '@redhat-cloud-services/frontend-components-utilities';

import messages from '../../Messages';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { cypressApplyFilters } from '../../../cypress/utils/table';

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
const mountComponent = ({ hasEdgeDevices } = { hasEdgeDevices: false }) => {
  const store = getStore();
  cy.mount(
    <MemoryRouter>
      <AccountStatContext.Provider value={{ hasEdgeDevices }}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={store}>
            <Routes>
              <Route
                key={'Recommendations'}
                path="*"
                element={<RulesTable />}
              />
            </Routes>
          </Provider>
        </IntlProvider>
      </AccountStatContext.Provider>
    </MemoryRouter>
  );
};

const expandContent = (rowNumber) => {
  cy.get('tbody[class="pf-v5-c-table__tbody pf-m-width-100"]')
    .eq(rowNumber)
    .find('button')
    .children()
    .eq(0)
    .should('exist')
    .click();
};

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
const INCIDENT = { Incident: 'true', 'Non-incident': 'false' };
const REMEDIATION = { 'Ansible playbook': true, Manual: false };
const REBOOT = { Required: true, 'Not required': false };
const UPDATE_METHOD_MAP = {
  '1 or more Conventional systems (RPM-DNF)': 'dnfyum',
};

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
  update_method: {
    selectorText: 'Systems impacted',
    values: Array.from(cumulativeCombinations(Object.keys(UPDATE_METHOD_MAP))),
    type: 'checkbox',
    filterFunc: () => {
      return 'dnfyum';
    },
    urlParam: 'update_method',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => UPDATE_METHOD_MAP[x]).join(',')),
  },
};

const filterApply = (filters) => cypressApplyFilters(filters, filtersConf);
const filterCombos = [
  {
    update_method: [
      '1 or more Conventional systems (RPM-DNF)',
      '1 or more Immutable (OSTree)',
    ],
  },
];

//the default count is 20, you can pass the other number if you need to
const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  update_method: [
    '1 or more Conventional systems (RPM-DNF)',
    '1 or more Immutable (OSTree)',
  ],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(rulesTableColumns, (it) => it.title);
const ROOT = 'table[aria-label=rule-table]';

describe('test data', () => {
  it('the first recommendation has systems impacted', () => {
    expect(fixtures.data[0].impacted_systems_count).be.gt(0);
  });
});

describe('renders correctly', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
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
    mountComponent({ hasEdgeDevices: true });
  });
  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-v5-c-menu-toggle__text')
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
    //initial call
    cy.wait('@call');
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Systems impacted', '1 or more Immutable (OSTree)');
    cy.get(CHIP_GROUP).find('.pf-v5-c-chip__text').should('have.length', 3);
  });

  it('name filter is a default filter', () => {
    cy.get('button[aria-label="Conditional filter"]')
      .find('span[class=ins-c-conditional-filter__value-selector]')
      .should('have.text', 'Name');
    cy.get(CONDITIONAL_FILTER).should('exist');
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
    mountComponent({ hasEdgeDevices: true });
  });
  it('shows correct total number of rules', () => {
    checkPaginationTotal(fixtures.meta.count);
  });

  it('values are expected ones', () => {
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    //FIXME: best way to make the loop
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el).then(() => {
        expect(window.location.search).to.contain(`limit=${el}`);
      });
    });
  });
});

describe('filtering', () => {
  beforeEach(() => {
    cy.intercept('**/api/insights/v1/rule/**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent({ hasEdgeDevices: true });
  });
  it('can clear filters', () => {
    cy.get(CHIP_GROUP)
      .find(CHIP)
      .ouiaId('close', 'button')
      .each(() => {
        cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button').eq(0).click();
      });
    //apply some filters
    filterApply(filterCombos[0]);
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(filterCombos[0]).length
    );
    cy.get(CHIP_GROUP).should('exist');
    //clear filters
    cy.get('button').contains('Reset filters').click();
    //check default filters
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Status', 'Enabled');
    cy.get(CHIP_GROUP).should(
      'have.length',
      Object.keys(DEFAULT_FILTERS).length
    );
    cy.get('button').contains('Reset filters').should('exist');
    //it is doubled because the expanded rows are also included
    checkRowCounts(DEFAULT_ROW_COUNT * 2);
  });

  it('no filters show all recommendations', () => {
    removeAllChips();
    checkRowCounts(DEFAULT_ROW_COUNT * 2);
    checkPaginationTotal(fixtures.meta.count);
  });

  describe('sends a request with correct parameters', () => {
    Object.entries(filtersConf).forEach(([key, config]) => {
      const { urlParam, values, urlValue, selectorText } = config;

      it(`apply ${selectorText} filter`, () => {
        //initial call
        cy.wait('@call');

        if (selectorText === filtersConf.update_method.selectorText) {
          removeAllChips();
          cy.wait(['@call']);
        }
        filterApply({ [key]: values[0] });
        cy.wait('@call');
        cy.wait('@call')
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(values[0])}`);
      });
    });
  });
});
describe('sorting', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent({ hasEdgeDevices: true });
  });
  function checkSortingUrl(label, order, dataField) {
    //get appropriate locators
    const header = `th[data-label="${label}"]`;
    //sort by column and verify URL
    if (order === 'ascending') {
      cy.get(header).find('button').click();
      cy.url().should('include', `sort=${dataField}`);
    } else {
      cy.get(header).find('button').click();
      cy.wait(['@call', '@call']);
      cy.get(header).find('button').click();
      cy.url().should('include', `sort=-${dataField}`);
    }
  }

  _.zip(
    [
      'description',
      'publish_date',
      'category',
      'total_risk',
      'impacted_count',
      'playbook_count',
    ],
    TABLE_HEADERS
  ).forEach(([category, label]) => {
    let sortingParameter = category;
    SORTING_ORDERS.forEach((order) => {
      it(`${order} by ${label}`, () => {
        checkSortingUrl(label, order, sortingParameter);
      });
    });
  });
});

const urlParamsList = [
  'impacting=true&rule_status=enabled&sort=-total_risk&limit=20&offset=0#SIDs=&tags=',
  'impacting=false&rule_status=enabled&sort=-recommendation_level&limit=20&offset=0#SIDs=&tags=',
];

urlParamsList.forEach((urlParams, index) => {
  describe(`pre-filled url search parameters ${index}`, () => {
    beforeEach(() => {
      cy.intercept('*', {
        statusCode: 201,
        body: {
          ...fixtures,
        },
      }).as('call');

      cy.mount(
        <MemoryRouter
          initialEntries={[`/recommendations?${urlParams}`]}
          initialIndex={0}
        >
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={getStore()}>
              <RulesTable />
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      );
    });

    it('sorts properly even if url doesnt match params for table', () => {
      const column = 'Total risk';
      tableIsSortedBy(column);
    });
  });
});

describe('content', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent({ hasEdgeDevices: true });
  });

  it('has correct links', () => {
    expandContent(1);

    cy.get('.ins-c-rule-details')
      .eq(0)
      .find('a')
      .contains('Knowledgebase article')
      .should(
        'have.attr',
        'href',
        'https://access.redhat.com/node/' + fixtures.data[0].node_id
      );

    cy.get('.ins-c-rule-details')
      .eq(0)
      .find('a')
      .contains(
        `View ${fixtures.data[0].impacted_systems_count} affected systems`
      )
      .should(
        'have.attr',
        'href',
        '///recommendations/' + fixtures.data[0].rule_id
      );
  });
});
