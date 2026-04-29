import React, { Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { EnvironmentContext } from '../App';
import { createTestEnvironmentContext } from '../../cypress/support/globals';
import Wrapper from '../Utilities/Wrapper';
import { Bullseye, Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';

const MockSystemAdvisor = () => (
  <div data-testid="system-advisor">SystemAdvisor</div>
);

const SystemDetailContent = ({
  customItnl,
  intlProps,
  store,
  IopRemediationModal,
  envContext,
}) => {
  const WrapperComp = customItnl ? IntlProvider : Fragment;
  const ReduxProvider = store ? Provider : Fragment;

  return (
    <EnvironmentContext.Provider value={envContext}>
      <WrapperComp
        {...(customItnl && {
          locale: navigator.language.slice(0, 2),
          messages: {},
          ...intlProps,
        })}
      >
        <ReduxProvider {...(store && { store })}>
          <MockSystemAdvisor IopRemediationModal={IopRemediationModal} />
        </ReduxProvider>
      </WrapperComp>
    </EnvironmentContext.Provider>
  );
};

SystemDetailContent.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.object,
  store: PropTypes.object,
  IopRemediationModal: PropTypes.elementType,
  envContext: PropTypes.object.isRequired,
};

const MockSystemDetail = ({ showSpinner, ...props }) => {
  const envContext = createTestEnvironmentContext();

  if (showSpinner) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  return <SystemDetailContent envContext={envContext} {...props} />;
};

MockSystemDetail.propTypes = {
  showSpinner: PropTypes.bool,
};

const mountComponent = (showSpinner = false, props = {}) => {
  cy.mount(
    <Wrapper>
      <MockSystemDetail showSpinner={showSpinner} {...props} />
    </Wrapper>,
  );
};

describe('Loading states', () => {
  it('shows loading spinner when flags not ready', () => {
    mountComponent(true);

    cy.get('.pf-v6-l-bullseye').should('exist');
    cy.get('.pf-v6-c-spinner').should('exist');
    cy.get('.pf-v6-c-spinner').should('have.class', 'pf-m-lg');
  });

  it('renders content when flags ready', () => {
    mountComponent(false);

    cy.get('.pf-v6-c-spinner').should('not.exist');
    cy.get('[data-testid="system-advisor"]').should('exist');
  });
});

describe('Props handling', () => {
  it('handles custom internationalization', () => {
    mountComponent(false, {
      customItnl: true,
      intlProps: {
        locale: 'en',
        messages: { test: 'Test' },
      },
    });

    cy.get('[data-testid="system-advisor"]').should('exist');
  });

  it('handles store prop', () => {
    mountComponent(false, {
      store: null,
    });

    cy.get('[data-testid="system-advisor"]').should('exist');
  });

  it('passes IopRemediationModal prop', () => {
    const mockIopModal = () => <div>IOP</div>;

    mountComponent(false, {
      IopRemediationModal: mockIopModal,
    });

    cy.get('[data-testid="system-advisor"]').should('exist');
  });
});
