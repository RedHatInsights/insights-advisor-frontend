import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';

import Topics from './Topics';

const mountComponent = () => {
  const store = getStore();
  cy.mount(
    <MemoryRouter>
      <IntlProvider>
        <Provider store={store}>
          <Topics />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('renders correctly', () => {
  beforeEach(() => {
    /*    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call'); */
    mountComponent();
  });
  it('The Rules table renders', () => {
    cy.get('table').should('have.length', 1);
  });
});
