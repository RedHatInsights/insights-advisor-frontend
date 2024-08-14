import React from 'react';
import Loading from './Loading';

describe('Loading', () => {
  beforeEach(() => {
    cy.mount(<Loading />);
  });

  it('Loading component exist', () => {
    // eslint-disable-next-line no-undef
    cy.get('div');
  });
});
