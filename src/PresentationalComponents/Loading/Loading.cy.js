import React from 'react';
import Loading from './Loading';

describe('Loading', () => {
  beforeEach(() => {
    cy.mount(<Loading />);
  });

  it('Loading component exist', () => {
    cy.get('div');
  });
});
