import React from 'react';
import { mount } from '@cypress/react18';
import Loading from './Loading';

describe('Loading', () => {
  beforeEach(() => {
    mount(<Loading />);
  });

  it('Loading component exist', () => {
    // eslint-disable-next-line no-undef
    cy.get('div');
  });
});
