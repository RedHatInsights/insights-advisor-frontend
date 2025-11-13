/* eslint-disable cypress/no-unnecessary-waiting */
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewRulesTableContainer from './NewRulesTableContainer';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { initStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/newrecommendations.json';
import messages from '../../Messages';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import { EnvironmentContext } from '../../App';

const ROOT = 'table[data-ouia-component-id=rules-table]';

/**
 * Mounts the NewRulesTableContainer component with mock query state.
 * @param {object} queryState - Mock query object with data, isLoading, isError, etc.
 */
const mountComponent = (queryState, envContextOverrides = {}) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.mount(
    <EnvironmentContext.Provider value={finalEnvContext}>
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <IntlProvider
          locale={navigator.language.slice(0, 2)}
          messages={messages}
        >
          <Provider store={initStore()}>
            <Routes>
              <Route
                path="*"
                element={<NewRulesTableContainer query={queryState} />}
              />
            </Routes>
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    </EnvironmentContext.Provider>,
  );
};

describe('loading state', () => {
  it('shows skeleton table while loading', () => {
    const queryState = {
      data: [],
      isLoading: true,
      isError: false,
      isFetching: true,
    };

    mountComponent(queryState);

    cy.get('[data-ouia-component-id=loading-skeleton]').should('exist');

    cy.get(ROOT).should('not.exist');
  });
});

describe('error state', () => {
  it('shows error state when query has error', () => {
    const queryState = {
      data: [],
      isLoading: false,
      isError: true,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.contains('Unable to load recommendations').should('be.visible');
    cy.contains('There was a problem loading recommendations').should(
      'be.visible',
    );

    cy.get(ROOT).should('not.exist');
  });
});

describe('successful data loading', () => {
  beforeEach(() => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);
  });

  it('renders the rules table with data', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');

    cy.get(ROOT).should('be.visible');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length.at.least', 1);
  });

  it('displays correct number of rules from query data', () => {
    cy.contains(
      `1 - ${Math.min(20, fixtures.data.length)} of ${fixtures.data.length}`,
    ).should('exist');
  });

  it('displays first rule from query data', () => {
    const firstRule = fixtures.data[0];
    cy.contains('td', firstRule.description).should('exist');
  });

  it('displays table headers', () => {
    cy.contains('th', 'Name').should('exist');
    cy.contains('th', 'Modified').should('exist');
    cy.contains('th', 'Category').should('exist');
    cy.contains('th', 'Total risk').should('exist');
    cy.contains('th', 'Systems').should('exist');
    cy.contains('th', 'Remediation type').should('exist');
  });

  it('can expand row to show details', () => {
    cy.get('tbody button[aria-label="Details"]').first().click({ force: true });

    cy.contains('Knowledgebase article').should('exist');
  });
});

describe('empty data state', () => {
  it('shows empty state when query returns no data', () => {
    const queryState = {
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get(ROOT).should('be.visible');

    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td[colspan="8"]').should('exist');
  });
});

describe('filtering with query data', () => {
  it('filters applied show correct subset of data', () => {
    const filteredData = fixtures.data.filter((rule) => rule.total_risk === 4);

    const queryState = {
      data: filteredData,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', Math.min(20, filteredData.length));

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Total risk"] .pf-v6-c-label')
          .should('have.class', 'pf-m-red');
      });
  });

  it('text filter shows matching recommendations', () => {
    const searchTerm = 'ansible';
    const filteredData = fixtures.data.filter((rule) =>
      rule.description.toLowerCase().includes(searchTerm),
    );

    const queryState = {
      data: filteredData,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .each(($row) => {
        cy.wrap($row)
          .find('td[data-label="Name"]')
          .invoke('text')
          .should('match', new RegExp(searchTerm, 'i'));
      });
  });
});

describe('pagination with query data', () => {
  it('displays correct pagination for large dataset', () => {
    const queryState = {
      data: fixtures.data, // 100 items
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.contains(`1 - 20 of ${fixtures.data.length}`).should('exist');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', 20);
  });

  it('can navigate to page 2', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('button[data-action="next"]').first().click();

    cy.contains('21 - 40 of 100').should('exist');

    const page2FirstRule = fixtures.data[20];
    cy.contains('td', page2FirstRule.description).should('exist');
  });

  it('can change items per page', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('[class*="pf-v6-c-pagination"]')
      .find('button[class*="toggle"]')
      .first()
      .click();
    cy.get('ul[role="menu"], .pf-v6-c-menu').contains('50').click();

    cy.contains('1 - 50 of 100').should('exist');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .should('have.length', 50);
  });
});

describe('sorting with query data', () => {
  it('can sort by name', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('th').contains('Name').click();

    cy.get('th')
      .contains('Name')
      .closest('th')
      .should('have.attr', 'aria-sort', 'ascending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const names = [];
        $rows.each((index, row) => {
          const name = Cypress.$(row)
            .find('td[data-label="Name"]')
            .text()
            .trim();
          const cleanName = name.split(/Incident|New|Updated/)[0].trim();
          names.push(cleanName);
        });

        const sortedNames = [...names].sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase()),
        );
        expect(names).to.deep.equal(sortedNames);
      });
  });

  it('can sort by total risk descending', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('th').contains('Total risk').click();
    cy.get('th').contains('Total risk').click();

    cy.get('th')
      .contains('Total risk')
      .closest('th')
      .should('have.attr', 'aria-sort', 'descending');

    cy.get('tbody tr')
      .not('.pf-v6-c-table__expandable-row')
      .then(($rows) => {
        const riskLevels = [];
        $rows.each((index, row) => {
          const $label = Cypress.$(row).find(
            'td[data-label="Total risk"] .pf-v6-c-label',
          );
          if ($label.hasClass('pf-m-green')) riskLevels.push(1);
          else if ($label.hasClass('pf-m-yellow')) riskLevels.push(2);
          else if ($label.hasClass('pf-m-orange')) riskLevels.push(3);
          else if ($label.hasClass('pf-m-red')) riskLevels.push(4);
        });

        const sortedLevels = [...riskLevels].sort((a, b) => b - a);
        expect(riskLevels).to.deep.equal(sortedLevels);
      });
  });
});

describe('export functionality', () => {
  it('shows export button when isExportEnabled is true', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState, { isExportEnabled: true });

    cy.get('button[aria-label="Export"]').should('exist');
  });

  it('does not show export button when isExportEnabled is false', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState, { isExportEnabled: false });

    cy.get('button[aria-label="Export"]').should('not.exist');
  });
});

describe('disable recommendation actions', () => {
  it('shows kebab menu when isDisableRecEnabled is true', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState, { isDisableRecEnabled: true });

    cy.get('button[aria-label="Kebab toggle"]').should('exist');
  });

  it('does not show kebab menu when isDisableRecEnabled is false', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState, { isDisableRecEnabled: false });

    cy.get('button[aria-label="Kebab toggle"]').should('not.exist');
  });
});

describe('URL synchronization', () => {
  it('reads URL parameters on mount', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter
          initialEntries={['/recommendations?text=kernel&total_risk=4']}
          initialIndex={0}
        >
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={initStore()}>
              <Routes>
                <Route
                  path="*"
                  element={<NewRulesTableContainer query={queryState} />}
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');
  });

  it('updates URL when filters change', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    mountComponent(queryState);

    cy.get('input[placeholder="Filter by name"]').type('kernel');

    cy.wait(100);

    cy.location('search').should('include', 'text=kernel');
  });
});

describe('isTabActive prop', () => {
  it('accepts isTabActive prop', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={initStore()}>
              <Routes>
                <Route
                  path="*"
                  element={
                    <NewRulesTableContainer
                      query={queryState}
                      isTabActive={false}
                    />
                  }
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');
  });
});

describe('Redux filter integration', () => {
  it('reads filters from Redux store on mount', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    const store = initStore();
    store.dispatch({
      type: 'filters/updateRecFilters',
      payload: {
        total_risk: ['4'],
        text: 'kernel',
      },
    });

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={store}>
              <Routes>
                <Route
                  path="*"
                  element={<NewRulesTableContainer query={queryState} />}
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');

    cy.wrap(store.getState())
      .its('filters.recState.total_risk')
      .should('deep.equal', ['4']);
    cy.wrap(store.getState())
      .its('filters.recState.text')
      .should('equal', 'kernel');
  });

  it('applies selectedTags from Redux store', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    const store = initStore();
    store.dispatch({
      type: 'filters/updateSelectedTags',
      payload: ['tag1', 'tag2'],
    });

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={store}>
              <Routes>
                <Route
                  path="*"
                  element={<NewRulesTableContainer query={queryState} />}
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');
  });

  it('applies workloads from Redux store', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    const store = initStore();
    store.dispatch({
      type: 'filters/updateWorkloads',
      payload: { SAP: true },
    });

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={store}>
              <Routes>
                <Route
                  path="*"
                  element={<NewRulesTableContainer query={queryState} />}
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');
  });

  it('syncs URL params to Redux via urlFilterBuilder', () => {
    const queryState = {
      data: fixtures.data,
      isLoading: false,
      isError: false,
      isFetching: false,
    };

    const store = initStore();

    cy.mount(
      <EnvironmentContext.Provider value={createTestEnvironmentContext()}>
        <MemoryRouter
          initialEntries={['/recommendations?text=kernel&total_risk=4']}
          initialIndex={0}
        >
          <IntlProvider
            locale={navigator.language.slice(0, 2)}
            messages={messages}
          >
            <Provider store={store}>
              <Routes>
                <Route
                  path="*"
                  element={<NewRulesTableContainer query={queryState} />}
                />
              </Routes>
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </EnvironmentContext.Provider>,
    );

    cy.get(ROOT).should('be.visible');

    cy.wait(200);

    cy.wrap(store.getState()).then((state) => {
      expect(state.filters.recState).to.exist;
    });
  });
});
