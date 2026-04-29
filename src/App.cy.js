import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { initStore } from './Store';
import { FlagProvider } from '@unleash/proxy-client-react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';

const messages = {
  en: {},
};

const MockApp = ({ flagsReady, isKesselEnabled }) => {
  if (!flagsReady) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return (
    <div data-testid={isKesselEnabled ? 'kessel-mode' : 'rbac-mode'}>
      {isKesselEnabled ? 'Kessel Mode' : 'RBAC v1 Mode'}
    </div>
  );
};

MockApp.propTypes = {
  flagsReady: PropTypes.bool.isRequired,
  isKesselEnabled: PropTypes.bool.isRequired,
};

describe('App Component - Feature Flag Loading', () => {
  const createMockUnleashClient = (flagsReady, kesselEnabled) => ({
    on: () => {},
    off: () => {},
    start: () => Promise.resolve(),
    stop: () => {},
    updateContext: () => Promise.resolve(),
    getVariant: () => ({ name: 'disabled', enabled: false }),
    isEnabled: (flag) => {
      if (flag === 'advisor.kessel_enabled') {
        return kesselEnabled;
      }
      return false;
    },
    getAllToggles: () => [],
    setContextField: () => {},
    getContext: () => ({}),
    flagsReady,
    flagsError: null,
  });

  const mountApp = (flagsReady, kesselEnabled) => {
    const mockClient = createMockUnleashClient(flagsReady, kesselEnabled);

    cy.mount(
      <FlagProvider unleashClient={mockClient}>
        <MemoryRouter>
          <IntlProvider locale="en" messages={messages.en}>
            <Provider store={initStore()}>
              <MockApp
                flagsReady={flagsReady}
                isKesselEnabled={kesselEnabled}
              />
            </Provider>
          </IntlProvider>
        </MemoryRouter>
      </FlagProvider>,
    );
  };

  it('shows loading spinner while waiting for feature flags', () => {
    mountApp(false, false);

    cy.get('.pf-v6-l-bullseye').should('exist');
    cy.get('.pf-v6-c-spinner').should('exist');
    cy.get('.pf-v6-c-spinner').should('have.class', 'pf-m-xl');

    cy.get('[data-testid="rbac-mode"]').should('not.exist');
    cy.get('[data-testid="kessel-mode"]').should('not.exist');
  });

  it('renders RBAC v1 context after flags load with Kessel disabled', () => {
    mountApp(true, false);

    cy.get('.pf-v6-c-spinner').should('not.exist');

    cy.get('[data-testid="rbac-mode"]').should('exist');
    cy.get('[data-testid="kessel-mode"]').should('not.exist');
  });

  it('renders Kessel context after flags load with Kessel enabled', () => {
    mountApp(true, true);

    cy.get('.pf-v6-c-spinner').should('not.exist');

    cy.get('[data-testid="kessel-mode"]').should('exist');
    cy.get('[data-testid="rbac-mode"]').should('not.exist');
  });
});
