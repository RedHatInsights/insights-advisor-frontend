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

    it('renders with correct default reason (NO_MATCH)', () => {
      cy.get('div[class*="pf-v6-c-empty-state"]').should('exist');
      cy.get('div[class*="bullseye"]').contains('No matching systems found');
      cy.get('div[class*="bullseye"]').contains(
        'To continue, edit your filter settings and search again.',
      );
    });

    it('uses small variant for empty state', () => {
      cy.get('div[class*="pf-v6-c-empty-state"]').should(
        'have.class',
        'pf-m-sm',
      );
    });

    it('displays an icon in the empty state', () => {
      cy.get('div[class*="pf-v6-c-empty-state"]').find('svg').should('exist');
    });
  });

  describe('different reason types', () => {
    describe('NO_MATCH reason', () => {
      beforeEach(() => {
        mountComponent({ reason: NO_SYSTEMS_REASONS.NO_MATCH });
      });

      it('displays correct title text', () => {
        cy.get('div[class*="bullseye"]').contains('No matching systems found');
      });

      it('displays correct body text', () => {
        cy.get('div[class*="bullseye"]').contains(
          'To continue, edit your filter settings and search again.',
        );
      });

      it('displays the complete message', () => {
        cy.get('div[class*="pf-v6-c-empty-state"]')
          .first()
          .within(() => {
            cy.contains('No matching systems found');
            cy.contains(
              'To continue, edit your filter settings and search again.',
            );
          });
      });
    });

    describe('ERROR reason', () => {
      beforeEach(() => {
        mountComponent({ reason: NO_SYSTEMS_REASONS.ERROR });
      });

      it('displays correct error title', () => {
        cy.get('div[class*="bullseye"]').contains(
          'Error encountered when fetching systems.',
        );
      });

      it('displays correct error body text', () => {
        cy.get('div[class*="bullseye"]').contains(
          'To continue, try resetting the filters and search again.',
        );
      });

      it('displays the complete error message', () => {
        cy.get('div[class*="pf-v6-c-empty-state"]')
          .first()
          .within(() => {
            cy.contains('Error encountered when fetching systems.');
            cy.contains(
              'To continue, try resetting the filters and search again.',
            );
          });
      });

      it('shows an icon for the error state', () => {
        cy.get('div[class*="pf-v6-c-empty-state"]').find('svg').should('exist');
      });
    });

    describe('Unknown/Invalid reason', () => {
      beforeEach(() => {
        mountComponent({ reason: 'unknown_reason' });
      });

      it('falls back to default NO_MATCH title', () => {
        cy.get('div[class*="bullseye"]').contains('No matching systems found');
      });

      it('falls back to default NO_MATCH body text', () => {
        cy.get('div[class*="bullseye"]').contains(
          'To continue, edit your filter settings and search again.',
        );
      });

      it('still renders the empty state component', () => {
        cy.get('div[class*="pf-v6-c-empty-state"]').should('exist');
      });
    });

    describe('Undefined/Null reason', () => {
      it('handles undefined reason gracefully', () => {
        mountComponent({ reason: undefined });
        cy.get('div[class*="bullseye"]').contains('No matching systems found');
        cy.get('div[class*="bullseye"]').contains(
          'To continue, edit your filter settings and search again.',
        );
      });

      it('handles null reason gracefully', () => {
        mountComponent({ reason: null });
        cy.get('div[class*="bullseye"]').contains('No matching systems found');
        cy.get('div[class*="bullseye"]').contains(
          'To continue, edit your filter settings and search again.',
        );
      });
    });
  });

  describe('component structure', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('renders inside a Bullseye component', () => {
      cy.get('div[class*="bullseye"]').should('exist');
    });

    it('contains EmptyState component', () => {
      cy.get('div[class*="pf-v6-c-empty-state"]').should('exist');
    });

    it('contains EmptyStateBody component', () => {
      cy.get('div[class*="pf-v6-c-empty-state__body"]').should('exist');
    });

    it('has proper content hierarchy', () => {
      cy.get('div[class*="bullseye"]')
        .find('div[class*="pf-v6-c-empty-state"]')
        .should('exist')
        .find('div[class*="pf-v6-c-empty-state__body"]')
        .should('exist');
    });
  });

  describe('accessibility', () => {
    it('is visible and accessible (NO_MATCH)', () => {
      mountComponent({ reason: NO_SYSTEMS_REASONS.NO_MATCH });
      cy.get('div[class*="pf-v6-c-empty-state"]').should('be.visible');
    });

    it('is visible and accessible (ERROR)', () => {
      mountComponent({ reason: NO_SYSTEMS_REASONS.ERROR });
      cy.get('div[class*="pf-v6-c-empty-state"]').should('be.visible');
    });

    it('contains readable text content', () => {
      mountComponent({ reason: NO_SYSTEMS_REASONS.ERROR });
      cy.get('div[class*="pf-v6-c-empty-state"]')
        .invoke('text')
        .should('not.be.empty');
    });
  });
});
