import React from 'react';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { initStore } from '../../../Store';
import NoSystemsTable from './NoSystemsTable';
import { NO_SYSTEMS_REASONS } from '../../../AppConstants';

const mountComponent = (props = {}) => {
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0, 2)}>
        <Provider store={initStore()}>
          <NoSystemsTable {...props} />
        </Provider>
      </IntlProvider>
    </MemoryRouter>,
  );
};

describe('No systems table test', () => {
  describe('defaults', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('The empty message wording is correct for default reason (no_match)', () => {
      cy.get('div[class*="bullseye"]').contains('No matching systems found');
      cy.get('div[class*="bullseye"]').contains(
        'To continue, edit your filter settings and search again.',
      );
    });
  });

  describe('different reason types', () => {
    it('should display no_match reason content', () => {
      mountComponent({ reason: NO_SYSTEMS_REASONS.NO_MATCH });
      cy.get('div[class*="bullseye"]').contains('No matching systems found');
      cy.get('div[class*="bullseye"]').contains(
        'To continue, edit your filter settings and search again.',
      );
    });

    it('should display error reason content', () => {
      mountComponent({ reason: NO_SYSTEMS_REASONS.ERROR });
      cy.get('div[class*="bullseye"]').contains(
        'Error encountered when fetching systems.',
      );
      cy.get('div[class*="bullseye"]').contains(
        'To continue, try resetting the filters and search again.',
      );
    });

    it('should fallback to default content for unknown reason', () => {
      mountComponent({ reason: 'unknown_reason' });
      cy.get('div[class*="bullseye"]').contains('No matching systems found');
      cy.get('div[class*="bullseye"]').contains(
        'To continue, edit your filter settings and search again.',
      );
    });
  });
});
