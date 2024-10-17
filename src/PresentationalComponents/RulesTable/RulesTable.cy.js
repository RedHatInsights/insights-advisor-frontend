import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import _ from 'lodash';
import { rulesTableColumns } from '../../../cypress/support/globals';

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
import {
  // eslint-disable-next-line no-unused-vars
  cumulativeCombinations,
  cypressApplyFilters,
} from '../../../cypress/utils/table';
import { filtersConf } from '../../../cypress/rulestablesconsts';

const mountComponent = ({ hasEdgeDevices } = { hasEdgeDevices: false }) => {
  cy.mount(
    <MemoryRouter>
      <AccountStatContext.Provider value={{ hasEdgeDevices }}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={initStore()}>
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

const filterApply = (filters) => cypressApplyFilters(filters, filtersConf);
const filterCombos = [{ impacting: ['1 or more'] }];

//the default count is 20, you can pass the other number if you need to
const DEFAULT_ROW_COUNT = 20;
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
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
    mountComponent();
  });
  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-v5-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
  });
  it('sorting using Total risk', () => {
    const column = 'Total risk';
    tableIsSortedBy(column);
  });
  it('links to the recommendations detail page', () => {
    cy.get('tbody tr:first [data-label=Name] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
    cy.get('tbody tr:first [data-label=Systems] a')
      .should('have.attr', 'href')
      .and('include', `/recommendations/${fixtures.data[0].rule_id}`);
  });

  it('applies total risk "Enabled" and systems impacted "1 or more" filters', () => {
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
    //initial call
    cy.wait('@call');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(CHIP_GROUP).find('.pf-v5-c-chip__text').should('have.length', 2);
  });

  it('name filter is a default filter', () => {
    cy.get('button[aria-label="Conditional filter toggle"]')
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
    mountComponent();
  });
  it('shows correct total number of rules', () => {
    checkPaginationTotal(fixtures.meta.count);
  });

  it('values are expected ones', () => {
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el).then(() => {
        expect(window.location.search).to.contain(`limit=${el}`);
      });
    });
  });
});

describe('filtering', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
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
    hasChip('Systems impacted', '1 or more');
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

  it('will reset filters but not pagination and sorting', () => {
    filterApply({ name: 'Lo' });

    cy.get('th[data-label="Name"]').find('button').click();
    cy.get(TOOLBAR).find('button').contains('Reset filters').click();
    cy.get('th[data-label="Name"]')
      .should('have.attr', 'aria-sort')
      .and('contain', 'ascending');
  });
});

describe('making request based on filters', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    cy.intercept('**text=foobar**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('text=foobar');
    cy.intercept('**res_risk**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('res_risk=1');
    cy.intercept('**total_risk=1**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('total_risk=1');
    cy.intercept('**likelihood**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('likelihood=1');
    cy.intercept('**category**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('category=2');
    cy.intercept('**incident**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('incident=true');
    cy.intercept('**impact=1**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('impact=1');
    cy.intercept('**reboot=true**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('reboot=true');
    cy.intercept('**rule_status=all**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('rule_status=all');
    cy.intercept('**has_playbook=true**', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('has_playbook=true');
    mountComponent();
  });
  Object.entries(filtersConf).forEach(([key, config]) => {
    const { urlParam, values, urlValue, selectorText } = config;

    it(`apply ${selectorText} filter`, () => {
      removeAllChips();
      cy.get('button').contains('Reset filters').click();
      if (selectorText === 'Systems impacted') {
        cy.wait(['@call']);
        cy.wait(['@call']);
      }
      if (selectorText !== 'Systems impacted') {
        filterApply({ [key]: values[0] });
        cy.wait(['@call']);
        cy.wait([`@${urlParam}=${urlValue(values[0])}`])
          .its('request.url')
          .should('include', `${urlParam}=${urlValue(values[0])}`);
      }
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
    mountComponent();
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
    TABLE_HEADERS.filter((h) => h !== 'Data expansion table header cell')
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
            <Provider store={initStore()}>
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
    mountComponent();
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

/* const UPDATE_METHOD_MAP = {
  '1 or more Conventional systems (RPM-DNF)': 'dnfyum',
  '1 or more Immutable (OSTree)': 'ostree',
};

const update_method = {
  selectorText: 'Systems impacted',
  values: Array.from(cumulativeCombinations(Object.keys(UPDATE_METHOD_MAP))),
  type: 'checkbox',
  filterFunc: () => {
    return 'dnfyum';
  },
  urlParam: 'update_method',
  urlValue: (it) =>
    encodeURIComponent(_.map(it, (x) => UPDATE_METHOD_MAP[x]).join(',')),
};

const applyUpdateMethod = (filters) =>
  cypressApplyFilters(filters, { update_method });

describe('Edge devices tests', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('impact_call');
    mountComponent({ hasEdgeDevices: true });
  });

  it('table is loaded', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(ROOT).should('have.length', 1);
  });

  it(`with edge devices`, () => {
    const { values } = update_method;

    //initial call
    cy.wait('@impact_call');
    cy.get('button').contains('Reset filters').should('exist');

    applyUpdateMethod({ update_method: values[0] });
    cy.wait('@impact_call')
      .its('request.url')
      .should('include', `update_method=ostree%2Cdnfyum`);
  });
});

describe('defaults with edge devices', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    cy.intercept('**=edge?', {
      statusCode: 201,
      body: {
        data: {
          total: 1,
        },
        isSuccess: true,
      },
      query: {
        data: {
          total: 1,
        },
      },
    }).as('edgecall');
    mountComponent();
  });
  it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-v5-c-menu-toggle__text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
  });
  it('sorting using Total risk', () => {
    const column = 'Total risk';
    tableIsSortedBy(column);
  });
  it('applies total risk "Enabled" and systems impacted filters', () => {
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
    //initial call
    cy.wait('@call');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    hasChip('Systems impacted', '1 or more');
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
 */
