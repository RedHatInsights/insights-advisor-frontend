import React from 'react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/IntlProvider';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { initStore } from '../../../Store';
import NoSystemsTable from './NoSystemsTable';
import messages from '../../../Messages';

const mountComponent = () => {
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0.2)}>
        <Provider store={initStore()}>
          <NoSystemsTable />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('No systems table test', () => {
  beforeEach(() => {
    mountComponent();
  });

  describe('defaults', () => {
    it('The empty message wording is correct', () => {
      cy.get('div[class*="bullseye"]').contains(
        messages.noSystemsFoundHeader.defaultMessage
      );
      cy.get('div[class*="bullseye"]').contains(
        messages.noSystemsFoundBody.defaultMessage
      );
    });
  });
});
