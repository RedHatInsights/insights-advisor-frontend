import React from 'react';
import SystemDetail from './SystemDetail';
import { FlagProvider } from '@unleash/proxy-client-react';
import Wrapper from '../Utilities/Wrapper';

const mountComponent = (
  flagsReady = true,
  kesselEnabled = false,
  props = {},
) => {
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

  cy.intercept('/api/insights/v1/account_setting/', {
    statusCode: 200,
    body: {},
  });

  cy.mount(
    <FlagProvider unleashClient={mockClient}>
      <Wrapper>
        <SystemDetail {...props} />
      </Wrapper>
    </FlagProvider>,
  );
};

describe('Feature flag loading states', () => {
  it('shows spinner when flags not ready', () => {
    mountComponent(false, false);
    cy.get('.pf-v6-c-spinner').should('exist');
    cy.get('.pf-v6-c-spinner').should('have.class', 'pf-m-lg');
  });

  it('renders when flags ready with RBAC v1', () => {
    mountComponent(true, false);
    cy.get('body').should('exist');
  });

  it('renders when flags ready with Kessel enabled', () => {
    mountComponent(true, true);
    cy.get('body').should('exist');
  });
});

describe('Props handling', () => {
  it('handles custom internationalization', () => {
    mountComponent(true, false, {
      customItnl: true,
      intlProps: {
        locale: 'en',
        messages: { test: 'Test' },
      },
    });
    cy.get('body').should('exist');
  });

  it('handles store prop', () => {
    mountComponent(true, false, {
      store: null,
    });
    cy.get('body').should('exist');
  });

  it('passes IopRemediationModal prop', () => {
    const mockIopModal = () => <div>IOP</div>;
    mountComponent(true, false, {
      IopRemediationModal: mockIopModal,
    });
    cy.get('body').should('exist');
  });
});
