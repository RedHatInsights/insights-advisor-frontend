import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from '@cypress/react';
import RulesTable from './RulesTable';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import messages from '../../../locales/data.json';
import { getStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/rulesfixtures';

//I'm looking at the https://docs.cypress.io/guides/component-testing/custom-mount-react#React-Router

describe('test', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
  });
  it('The Rules table renders', () => {
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
    cy.get('table[aria-label=rule-table]').should('have.length', 1);
  });
});
