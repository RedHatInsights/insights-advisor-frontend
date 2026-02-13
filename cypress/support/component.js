// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
import '@patternfly/patternfly/patternfly.scss';
import { mount } from 'cypress/react';
import '@cypress/code-coverage/support';

Cypress.Commands.add('mount', mount);

// Example use:
// cy.mount(<MyComponent />)

// Mock insights chrome for platform interceptors
global.window.insights = {
  chrome: {
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            user: { username: 'testuser' },
          },
        }),
    },
  },
};

global.window.__scalprum__ = {
  scalprumOptions: {
    cacheTimeout: 999999,
  },
  appsConfig: {
    inventory: {},
    remediations: {},
  },
  factories: {
    inventory: {},
    remediations: {
      expiration: new Date('01-01-3000'),
      modules: {
        './RemediationButton': {
          __esModule: true,

          default: () => 'Remediations',
        },
      },
    },
  },
};
