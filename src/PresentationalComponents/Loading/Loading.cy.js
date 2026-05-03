import React from 'react';
import Loading from './Loading';

describe('Loading', () => {
  beforeEach(() => {
    cy.mount(<Loading />);
  });

  it('renders loading card with correct ouiaId', () => {
    cy.get('[data-ouia-component-id="loading-card"]').should('exist');
  });

  it('renders skeleton loader inside card', () => {
    cy.get('[data-ouia-component-id="loading-skeleton"]').should('exist');
  });

  it('displays skeleton loader as child of card body', () => {
    cy.get('[data-ouia-component-id="loading-card"]')
      .find('[data-ouia-component-id="loading-skeleton"]')
      .should('exist');
  });
});
