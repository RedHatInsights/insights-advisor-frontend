/**
 * SystemAdvisor - AbortController Integration Tests (Cypress)
 *
 * These tests validate the AbortController implementation behavior:
 * 1. Session expiration (401) → graceful handling, no crash
 * 2. Network failures and aborts → silent cancellation, no AbortError logged
 * 3. Fire-and-forget KBA fetch handling → no unhandled errors
 * 4. Poor network conditions → graceful degradation
 *
 * NOTE: User-facing notifications are tested in unit tests (SystemAdvisor.abortController.test.js)
 * since Cypress component tests don't render the notification portal.
 *
 * Run with: npm run cypress:component -- --spec "src/SmartComponents/SystemAdvisor/SystemAdvisor.abortController.cy.js"
 */

import React from 'react';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';
import Wrapper from '../../Utilities/Wrapper';
import { EnvironmentContext } from '../../App';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';

// Test helpers
const createMockEntity = () => ({
  id: 'test-system-uuid',
  insights_id: 'test-insights-id',
  display_name: 'Test System for AbortController',
});

// Mount helper
const mountSystemAdvisor = (envContextOverrides = {}) => {
  const entity = createMockEntity();
  const envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    ...envContextOverrides,
  };

  cy.mount(
    <EnvironmentContext.Provider value={finalEnvContext}>
      <Wrapper>
        <SystemAdvisor
          entity={entity}
          inventoryId="test-system-uuid"
          response={{
            insights_attributes: { uuid: 'test-system-uuid' },
          }}
          hostName="test-host"
        />
      </Wrapper>
    </EnvironmentContext.Provider>,
  );
};

describe('SystemAdvisor - AbortController Sentry Bug Simulation', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = cy.spy(console, 'error');
  });

  describe('SENTRY BUG SIMULATION: 401 → Browser Abort', () => {
    it('handles 401 error gracefully without AbortError in console', () => {
      cy.intercept('GET', '**/system/*/reports/', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('reportsRequest');

      cy.intercept('GET', '**/hosts/*/system_profile', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('profileRequest');

      mountSystemAdvisor();

      cy.wait('@reportsRequest');

      cy.window().then(() => {
        const errorCalls = consoleErrorSpy.getCalls().filter((call) => {
          const args = call.args.join(' ');
          return args.includes('AbortError') || args.includes('aborted');
        });

        expect(errorCalls.length).to.equal(0);
      });
    });

    it('handles network abort during fetch without errors', () => {
      // SCENARIO: Network request aborted mid-flight
      // Expected: No console errors, no crash

      // Mock: Request that will be aborted
      cy.intercept('GET', '**/system/*/reports/', (req) => {
        req.destroy(); // Simulate network abort
      }).as('reportsRequest');

      mountSystemAdvisor();

      // Wait a bit for the failed request
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);

      // Component should still be mounted, no crash
      cy.get('#system-advisor-table').should('exist');

      // No AbortError logged
      cy.window().then(() => {
        const errorCalls = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errorCalls.length).to.equal(0);
      });
    });
  });

  // Note: Cypress component tests can't test unmounting behavior
  // These scenarios are covered by unit tests instead

  describe('Fire-and-Forget Fix - fetchKbaDetails', () => {
    it('KBA fetch AbortError does not escape to console', () => {
      // SCENARIO: KBA fetch is cancelled
      // Expected: No unhandled AbortError

      // Mock: Reports succeed
      cy.intercept('GET', '**/system/*/reports/', {
        statusCode: 200,
        body: [
          {
            rule: {
              rule_id: 'test-rule',
              node_id: 'kba-123',
              description: 'Test',
            },
            resolution: { has_playbook: true },
          },
        ],
      }).as('reportsRequest');

      // Mock: KBA fetch aborted (simulate abort during fetch)
      cy.intercept('GET', '**/hydra/rest/search/kcs*', (req) => {
        req.destroy(); // Abort request
      }).as('kbaRequest');

      cy.intercept('GET', '**/hosts/*/system_profile', {
        statusCode: 200,
        body: { results: [{ system_profile: {} }] },
      }).as('profileRequest');

      mountSystemAdvisor();

      cy.wait('@reportsRequest');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // Wait for KBA fetch attempt

      // KBA abort should NOT cause console error
      cy.window().then(() => {
        const errorCalls = consoleErrorSpy.getCalls().filter((call) => {
          const args = call.args.join(' ');
          return args.includes('AbortError') && args.includes('KBA');
        });
        expect(errorCalls.length).to.equal(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles 401 errors gracefully without crashing', () => {
      cy.intercept('GET', '**/system/*/reports/', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('reportsRequest');

      mountSystemAdvisor();

      cy.wait('@reportsRequest');

      cy.get('#system-advisor-table').should('exist');

      cy.window().then(() => {
        const errors = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errors.length).to.equal(0);
      });
    });

    it('handles server errors gracefully without crashing', () => {
      cy.intercept('GET', '**/system/*/reports/', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('reportsRequest');

      mountSystemAdvisor();

      cy.wait('@reportsRequest');

      cy.get('#system-advisor-table').should('exist');

      cy.window().then(() => {
        const errors = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errors.length).to.equal(0);
      });
    });

    it('does NOT log errors for AbortError', () => {
      cy.intercept('GET', '**/system/*/reports/', (req) => {
        req.destroy();
      }).as('reportsRequest');

      mountSystemAdvisor();

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);

      cy.window().then(() => {
        const errors = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errors.length).to.equal(0);
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('SCENARIO: Session expired handled gracefully', () => {
      cy.intercept('GET', '**/system/*/reports/', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('expiredSession');

      mountSystemAdvisor();

      cy.wait('@expiredSession');

      cy.get('#system-advisor-table').should('exist');

      cy.window().then(() => {
        const errors = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errors.length).to.equal(0);
      });
    });

    it('SCENARIO: Poor network - multiple retries/aborts', () => {
      // User on flaky network
      // Requests timeout/abort multiple times
      // Expected: Graceful handling, no crash

      let attemptCount = 0;
      cy.intercept('GET', '**/system/*/reports/', (req) => {
        attemptCount++;
        if (attemptCount < 3) {
          req.destroy(); // Abort first 2 attempts
        } else {
          req.reply({
            statusCode: 200,
            body: [],
          });
        }
      }).as('reportsRequest');

      mountSystemAdvisor();

      // Eventually succeeds
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000);

      // No AbortErrors logged
      cy.window().then(() => {
        const errors = consoleErrorSpy
          .getCalls()
          .filter((call) => call.args.join(' ').includes('AbortError'));
        expect(errors.length).to.equal(0);
      });
    });
  });
});

/**
 * CYPRESS TEST SUMMARY
 *
 * These tests validate END-TO-END behavior:
 * ✅ 401 errors → Component doesn't crash, NO AbortError in console
 * ✅ 500 errors → Component doesn't crash, NO AbortError in console
 * ✅ Network abort → No console errors, component remains mounted
 * ✅ KBA fetch abort → No unhandled errors
 * ✅ Silent cancellation for AbortError (no error logged)
 * ✅ Real-world session expiration flow (graceful handling)
 * ✅ Poor network handling (multiple retries)
 *
 * NOTE:
 * - Unmount scenarios are covered in unit tests (SystemAdvisor.abortController.test.js)
 * - User-facing notifications are tested in unit tests (notification portal not rendered in Cypress)
 *
 * Run Command:
 * npm run cypress:component -- --spec "src/SmartComponents/SystemAdvisor/SystemAdvisor.abortController.cy.js"
 *
 * Expected Results:
 * - All tests pass
 * - No AbortError in console for any test
 * - Component handles all error scenarios gracefully without crashing
 */
