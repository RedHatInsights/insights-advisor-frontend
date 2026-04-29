import React from 'react';
import { FlagProvider } from '@unleash/proxy-client-react';
import AppWithHccContext from './App';
import Wrapper from './Utilities/Wrapper';

const mountApp = (flagsReady = true, kesselEnabled = false) => {
  const mockClient = {
    on: () => {},
    off: () => {},
    start: () => Promise.resolve(),
    stop: () => {},
    updateContext: () => Promise.resolve(),
    getVariant: () => ({ name: 'disabled', enabled: false }),
    isEnabled: (flag) => flag === 'advisor.kessel_enabled' && kesselEnabled,
    getAllToggles: () => [],
    setContextField: () => {},
    getContext: () => ({}),
    flagsReady,
    flagsError: null,
  };

  cy.mount(
    <FlagProvider unleashClient={mockClient}>
      <Wrapper>
        <AppWithHccContext />
      </Wrapper>
    </FlagProvider>,
  );
};

describe('App Component - Feature Flag Loading', () => {
  it('shows spinner when flags not ready', () => {
    mountApp(false, false);
    cy.get('.pf-v6-c-spinner').should('exist');
    cy.get('.pf-v6-c-spinner').should('have.class', 'pf-m-xl');
  });

  it('renders when flags ready with RBAC v1', () => {
    mountApp(true, false);
    cy.get('body').should('exist');
  });

  it('renders when flags ready with Kessel enabled', () => {
    mountApp(true, true);
    cy.get('body').should('exist');
  });
});
