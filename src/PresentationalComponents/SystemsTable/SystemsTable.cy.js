import React from 'react';
import SystemsTable from './SystemsTable';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { Provider } from 'react-redux';
import { getStore } from '../../Store';
import fixtures from '../../../cypress/fixtures/systemsTable.json';

const ROOT = 'table[aria-label="Host inventory"]';

describe('renders correctly', () => {
  const store = getStore();
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    cy.mount(
      <IntlProvider>
        <Provider store={store}>
          <SystemsTable />
        </Provider>
      </IntlProvider>
    );
  });

  it('The Rules table renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });
});
