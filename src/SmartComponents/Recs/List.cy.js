/**
 * List Component Integration Tests
 *
 * These tests focus on the integration of List component features:
 * - Tab switching between Recommendations and Pathways
 * - Overview dashboard rendering and integration with recommendations
 * - URL parameter initialization and persistence across tabs
 * - Component coordination (dashboard + tabs + tables)
 *
 * Detailed functionality testing for child components (RulesTable, PathwaysTable)
 * is covered in their respective component test files.
 */
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import List from './List';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { initStore } from '../../Store';
import recommendations from '../../../cypress/fixtures/recommendations.json';
import pathways from '../../../cypress/fixtures/pathways.json';
import messages from '../../Messages';
import { createTestEnvironmentContext } from '../../../cypress/support/globals';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { EnvironmentContext } from '../../App';
import FlagProvider from '@unleash/proxy-client-react';

/**
 * Mounts the List component with optional URL parameters
 * IMPORTANT: Must set browser URL BEFORE mounting so paramParser() can read it
 */
const mountComponent = (
  {
    hasEdgeDevices = false,
    urlParams = '',
    initialPath = '/recommendations',
  } = {},
  envContextOverrides = {},
) => {
  let envContext = createTestEnvironmentContext();
  const finalEnvContext = {
    ...envContext,
    displayRecPathways: true, // Enable pathways tab for testing
    ...envContextOverrides,
  };

  // Set browser URL BEFORE mounting (critical for URL param tests)
  if (urlParams) {
    cy.window().then((win) => {
      win.history.pushState({}, '', `${initialPath}?${urlParams}`);
    });
  }

  cy.mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <EnvironmentContext.Provider value={finalEnvContext}>
        <MemoryRouter initialEntries={[initialPath]}>
          <AccountStatContext.Provider value={{ hasEdgeDevices }}>
            <IntlProvider
              locale={navigator.language.slice(0, 2)}
              messages={messages}
            >
              <Provider store={initStore()}>
                <Routes>
                  <Route path="/recommendations" element={<List />} />
                  <Route path="/recommendations/pathways" element={<List />} />
                </Routes>
              </Provider>
            </IntlProvider>
          </AccountStatContext.Provider>
        </MemoryRouter>
      </EnvironmentContext.Provider>
    </FlagProvider>,
  );
};

describe('List Component Integration', () => {
  beforeEach(() => {
    // Handle chrome.getApp() errors from lazy-loaded components
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('chrome.getApp is not a function')) {
        return false;
      }
      return true;
    });

    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: { toggles: [] },
    }).as('getFeatureFlag');

    cy.intercept('GET', '/api/insights/v1/stats/overview/', {
      statusCode: 200,
      body: {
        critical: 5,
        important: 10,
        moderate: 15,
        low: 20,
        incidents: 3,
        pathways: 7,
      },
    }).as('getOverviewStats');

    cy.intercept('GET', '/api/insights/v1/rule/*', {
      statusCode: 200,
      body: recommendations,
    }).as('getRecommendations');

    cy.intercept('GET', '/api/insights/v1/pathway/*', {
      statusCode: 200,
      body: pathways,
    }).as('getPathways');
  });

  describe('Basic Rendering', () => {
    it('renders page header, overview dashboard, and rules table', () => {
      mountComponent();

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.contains('Recommendations').should('exist');

      cy.get('#overview-dashbar').should('exist');
      cy.contains('Incidents').should('exist');
      cy.contains('Critical recommendations').should('exist');
      cy.contains('Important recommendations').should('exist');

      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');
      cy.get('[aria-label="rules-table"]', { timeout: 10000 }).should('exist');
      cy.get('th').contains('Name').should('exist');
    });

    it('displays correct overview counts from API', () => {
      mountComponent();

      cy.wait('@getOverviewStats');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
        cy.contains('10').should('exist');
      });
    });

    it('renders tabs when pathways are enabled', () => {
      mountComponent();

      cy.get('[role="tablist"]').should('exist');
      cy.contains('[role="tab"]', 'Recommendations').should('exist');
      cy.contains('[role="tab"]', 'Pathways').should('exist');
    });
  });

  describe('Tab Switching', () => {
    it('defaults to Recommendations tab', () => {
      mountComponent();

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );
      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'false',
      );
    });

    it('switches to Pathways tab when clicked', () => {
      mountComponent();

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('table').should('exist');
      cy.get('th').contains('Name').should('exist');
      cy.get('th').contains('Systems').should('exist');
    });

    it('switches back to Recommendations tab', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.wait('@getRecommendations');

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('loads Pathways tab directly from URL', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );
      cy.wait('@getPathways');
    });

    it('handles tab switching with batched data', () => {
      const recsTotal = 150;
      const pathwaysTotal = 120;
      const pageSize = 20;
      const recsIntercepted = [];
      const pathwaysIntercepted = [];

      cy.setupBatchInterceptors({
        url: '/api/insights/v1/rule/',
        total: recsTotal,
        pageSize,
        dataType: 'recommendations',
      });

      cy.setupBatchInterceptors({
        url: '/api/insights/v1/pathway/',
        total: pathwaysTotal,
        pageSize,
        dataType: 'pathways',
      });

      cy.intercept('GET', '/api/insights/v1/rule/*', (req) => {
        recsIntercepted.push(req);
      }).as('recsBatch');

      cy.intercept('GET', '/api/insights/v1/pathway/*', (req) => {
        pathwaysIntercepted.push(req);
      }).as('pathwaysBatch');

      mountComponent();

      cy.wait('@batchPage1', { timeout: 10000 });
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

      cy.wrap(null).then(() => {
        expect(recsIntercepted.length).to.be.greaterThan(0);
      });

      cy.contains('[role="tab"]', 'Pathways').click();

      cy.wait('@batchPage1', { timeout: 10000 });
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

      cy.wrap(null).then(() => {
        expect(pathwaysIntercepted.length).to.be.greaterThan(0);
      });

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[aria-label="rules-table"]', { timeout: 5000 }).should('exist');

      cy.wrap(null).then(() => {
        expect(recsIntercepted.length).to.be.greaterThan(0);
        expect(pathwaysIntercepted.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Overview Dashboard Integration', () => {
    it('renders overview dashboard with counts', () => {
      mountComponent();

      cy.wait('@getOverviewStats');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
        cy.contains('10').should('exist');
        cy.contains('Pathways').should('exist');
      });
    });

    it('overview dashboard cards are clickable', () => {
      mountComponent();

      cy.wait('@getOverviewStats');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('Incidents').closest('[data-ouia-component-type]').click();
      });
    });

    it('overview dashboard persists during pagination with batched data', () => {
      const total = 150;
      const pageSize = 20;

      cy.setupBatchInterceptors({
        url: '/api/insights/v1/rule/',
        total,
        pageSize,
        dataType: 'recommendations',
      });

      cy.intercept('GET', '/api/insights/v1/rule/*').as('recsBatch');

      mountComponent();

      cy.wait('@batchPage1', { timeout: 10000 });
      cy.wait('@getOverviewStats');

      cy.get('#overview-dashbar')
        .should('exist')
        .within(() => {
          cy.contains('3').should('exist');
          cy.contains('5').should('exist');
        });

      cy.get('button[data-action="next"]').first().click();
      cy.get('[aria-label="Loading"]', { timeout: 5000 }).should('not.exist');

      cy.get('#overview-dashbar')
        .should('exist')
        .within(() => {
          cy.contains('3').should('exist');
          cy.contains('5').should('exist');
        });

      cy.url().should('include', 'offset=20');
    });

    it('refetches overview data when rule is disabled', () => {
      let overviewCallCount = 0;

      cy.intercept('GET', '/api/insights/v1/stats/overview/', (req) => {
        overviewCallCount++;
        req.reply({
          statusCode: 200,
          body: {
            critical: overviewCallCount === 1 ? 5 : 4,
            important: overviewCallCount === 1 ? 10 : 9,
            moderate: 15,
            low: 20,
            incidents: overviewCallCount === 1 ? 3 : 2,
            pathways: 7,
          },
        });
      }).as('getOverviewStats');

      cy.intercept('POST', '/api/insights/v1/ack/', {
        statusCode: 201,
        body: {},
      }).as('disableRule');

      mountComponent({}, { isDisableRecEnabled: true });

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.contains('Critical recommendations')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('5').should('exist');
        });

      cy.contains('Important recommendations')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('10').should('exist');
        });

      cy.contains('Incidents')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('3').should('exist');
        });

      cy.clickOnRowKebab(
        'Reboot fails when there is no "kernelopts" option in the grubenv',
      );
      cy.contains('Disable recommendation').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#disable-rule-justification').type(
        'Testing overview refetch on disable',
      );
      cy.get('button[data-ouia-component-id="confirm"]').click();

      cy.wait('@disableRule');
      cy.wait('@getOverviewStats');

      cy.contains('Critical recommendations')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('4').should('exist');
        });

      cy.contains('Important recommendations')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('9').should('exist');
        });

      cy.contains('Incidents')
        .parents('.pf-v6-l-grid__item')
        .first()
        .within(() => {
          cy.contains('2').should('exist');
        });
    });
  });

  describe('Filtering in Recommendations Tab', () => {
    it('can filter by name', () => {
      mountComponent();

      cy.wait('@getRecommendations');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('kernel{enter}');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('can clear all filters', () => {
      mountComponent({ urlParams: 'total_risk=4&category=2' });

      cy.wait('@getRecommendations');

      cy.get('button').contains('Reset filters').click();

      cy.get('.pf-v6-c-label-group').contains('Critical').should('not.exist');
    });
  });

  describe('Filtering in Pathways Tab', () => {
    it('shows pathway filters when on pathways tab', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('[data-ouia-component-id="ConditionalFilter"]').should('exist');
    });
  });

  describe('URL Parameter Synchronization', () => {
    it('loads recommendations tab with filters from URL', () => {
      mountComponent({ urlParams: 'text=kernel' });

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('loads pathways tab when URL has pathways route', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('table').should('exist');
    });

    it('preserves filters when switching tabs', () => {
      mountComponent({ urlParams: 'impacting=true' });

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('1 or more').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('1 or more').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles overview API failure', () => {
      cy.intercept('GET', '/api/insights/v1/stats/overview/', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('getOverviewStatsError');

      mountComponent();
      cy.wait('@getOverviewStatsError');

      cy.contains('No Overview Available').should('exist');
      cy.get('[role="tablist"]').should('exist');
    });

    it('gracefully handles recommendations API failure', () => {
      cy.intercept('GET', '/api/insights/v1/rule/*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('getRecommendationsError');

      mountComponent();
      cy.wait('@getRecommendationsError');

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.get('#overview-dashbar').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for tabs', () => {
      mountComponent();

      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.length.at.least', 2);
    });

    it('has proper heading hierarchy', () => {
      mountComponent();
      cy.wait('@getOverviewStats');

      cy.get('h1').contains('Recommendations').should('exist');
    });

    it('has accessible overview dashboard cards', () => {
      mountComponent();
      cy.wait('@getOverviewStats');

      cy.get('#overview-dashbar').within(() => {
        cy.get('h6').should('have.length.at.least', 3);
      });
    });
  });

  describe('User Story: Complex Workflows', () => {
    it('User clicks critical card, filters recommendations, then switches to pathways', () => {
      mountComponent();

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('Critical recommendations')
          .closest('[data-ouia-component-type]')
          .click();
      });

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('table[aria-label="pathways-table"]').should('exist');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('User opens page with URL filters, clears them, switches tabs, and returns', () => {
      mountComponent({ urlParams: 'text=kernel&total_risk=4' });

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.get('button').contains('Reset filters').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('not.exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('not.exist');
    });

    it('User applies name filter in recommendations, switches to pathways, applies category filter, returns', () => {
      mountComponent();

      cy.wait('@getRecommendations');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('kernel{enter}');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('table[aria-label="pathways-table"]').should('exist');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('User sorts recommendations, switches to pathways, sorts pathways, returns to check sort persists', () => {
      mountComponent();

      cy.wait('@getRecommendations');

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th').contains('Name').click();
      });

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th')
          .contains('Name')
          .closest('th')
          .should('have.attr', 'aria-sort', 'ascending');
      });

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('table[aria-label="pathways-table"]').should('be.visible');

      cy.get('table[aria-label="pathways-table"]').within(() => {
        cy.get('th').contains('Systems').click();
      });

      cy.get('table[aria-label="pathways-table"]').within(() => {
        cy.get('th')
          .contains('Systems')
          .closest('th')
          .should('have.attr', 'aria-sort', 'ascending');
      });

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[aria-label="rules-table"]').should('be.visible');

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th')
          .contains('Name')
          .closest('th')
          .should('have.attr', 'aria-sort', 'ascending');
      });
    });

    it('User navigates directly to pathways URL, applies filters, then navigates to recommendations', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('table[aria-label="pathways-table"]').should('exist');

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.wait('@getRecommendations');

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('User opens page with filters, clicks incidents card (should switch filters), then resets', () => {
      mountComponent({ urlParams: 'text=kernel' });

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('Incidents').closest('[data-ouia-component-type]').click();
      });

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.get('button').contains('Reset filters').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('not.exist');
    });

    it('User switches between tabs multiple times and overview dashboard remains visible', () => {
      mountComponent();

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.get('#overview-dashbar').should('be.visible');
      cy.contains('Incidents').should('be.visible');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('#overview-dashbar').should('be.visible');
      cy.contains('Incidents').should('be.visible');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('#overview-dashbar').should('be.visible');
      cy.contains('Incidents').should('be.visible');

      cy.contains('[role="tab"]', 'Pathways').click();

      cy.get('#overview-dashbar').should('be.visible');
      cy.contains('Incidents').should('be.visible');
    });

    it('User applies multiple filters, switches tabs, clears filters on return', () => {
      mountComponent({ urlParams: 'text=kernel&impacting=true' });

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
      cy.get('.pf-v6-c-label-group').contains('1 or more').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('button').contains('Reset filters').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('not.exist');
    });

    it('User interacts with overview, filters, tabs, and verifies consistent behavior', () => {
      mountComponent();

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
      });

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('kernel{enter}');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
      });

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('User loads pathways with URL filter, switches to recommendations, applies different filter', () => {
      mountComponent({ initialPath: '/recommendations/pathways' });

      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.wait('@getRecommendations');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('kernel{enter}');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('User experiences full workflow: load with filters, modify filters, switch tabs, reset, navigate back', () => {
      mountComponent({ urlParams: 'text=kernel' });

      cy.wait('@getRecommendations');

      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );
      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th').contains('Name').click();
      });

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th')
          .contains('Name')
          .closest('th')
          .should('have.attr', 'aria-sort', 'ascending');
      });

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('table[aria-label="pathways-table"]').should('be.visible');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('Pathways').closest('[data-ouia-component-type]').click();
      });

      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[aria-label="rules-table"]').should('be.visible');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.get('[aria-label="rules-table"]').within(() => {
        cy.get('th')
          .contains('Name')
          .closest('th')
          .should('have.attr', 'aria-sort', 'ascending');
      });

      cy.get('button').contains('Reset filters').click();

      cy.get('.pf-v6-c-label-group').contains('kernel').should('not.exist');
    });

    it('User verifies page header and overview persist across all navigation', () => {
      mountComponent();

      cy.wait('@getOverviewStats');
      cy.wait('@getRecommendations');

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.contains('h1', 'Recommendations').should('exist');
      cy.get('#overview-dashbar').should('exist');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('test{enter}');

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.get('#overview-dashbar').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.contains('h1', 'Recommendations').should('exist');
      cy.get('#overview-dashbar').should('exist');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.get('#overview-dashbar').should('exist');

      cy.get('.pf-v6-c-label-group').contains('test').should('exist');
    });

    it('User performs rapid tab switching and verifies stability', () => {
      mountComponent();

      cy.wait('@getRecommendations');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');
      cy.get('table[aria-label="pathways-table"]').should('exist');
      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.get('[aria-label="rules-table"]').should('exist');
      cy.contains('[role="tab"]', 'Recommendations').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.get('table[aria-label="pathways-table"]').should('exist');
      cy.contains('[role="tab"]', 'Pathways').should(
        'have.attr',
        'aria-selected',
        'true',
      );

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.get('[aria-label="rules-table"]').should('exist');

      cy.get('#overview-dashbar').should('exist');
      cy.get('[role="tablist"]').should('exist');
    });

    it('User opens recommendations, applies filter via chip removal, switches tabs', () => {
      mountComponent();

      cy.wait('@getRecommendations');

      cy.get('.pf-v6-c-label-group').contains('1 or more').should('exist');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('test{enter}');

      cy.get('.pf-v6-c-label-group').contains('test').should('exist');

      cy.get('.pf-v6-c-label-group')
        .contains('test')
        .closest('.pf-v6-c-label')
        .find('button')
        .click();

      cy.get('.pf-v6-c-label-group').contains('test').should('not.exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('.pf-v6-c-label-group').contains('test').should('not.exist');
    });
  });

  describe('Batch Requests', () => {
    beforeEach(() => {
      cy.on('uncaught:exception', (err) => {
        if (err.message.includes('chrome.getApp is not a function')) {
          return false;
        }
        return true;
      });

      cy.intercept('GET', '/feature_flags*', {
        statusCode: 200,
        body: { toggles: [] },
      }).as('getFeatureFlag');

      cy.intercept('GET', '/api/insights/v1/stats/overview/', {
        statusCode: 200,
        body: {
          critical: 5,
          important: 10,
          moderate: 15,
          low: 20,
          incidents: 3,
          pathways: 7,
        },
      }).as('getOverviewStats');
    });

    it('handles multiple pages of recommendations with batch requests', () => {
      const totalRecs = 200;
      const pageSize = 50;

      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: totalRecs,
        pageSize,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@batchPage1');
      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('preserves filters when switching between tabs with batch data', () => {
      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: 150,
        pageSize: 50,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent({ urlParams: 'text=kernel' });

      cy.wait('@batchPage1');
      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.contains('[role="tab"]', 'Recommendations').click();
      cy.wait('@batchPage1');

      cy.get('.pf-v6-c-label-group').contains('kernel').should('exist');
    });

    it('handles batch request errors gracefully', () => {
      cy.intercept('GET', '**/api/insights/v1/rule/*offset=0*', {
        statusCode: 200,
        body: window.generateBatchRecommendationsData({
          total: 100,
          offset: 0,
          limit: 50,
        }),
      }).as('page1');

      cy.intercept('GET', '**/api/insights/v1/rule/*offset=50*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('page2Error');

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@page1');
      cy.get('[data-ouia-component-type="RHI/Header"]').should('exist');
      cy.get('#overview-dashbar').should('exist');
    });

    it('handles empty batch results', () => {
      cy.intercept('GET', '**/api/insights/v1/rule/*', {
        statusCode: 200,
        body: {
          data: [],
          meta: { count: 0, limit: 50, offset: 0 },
        },
      }).as('emptyResults');

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@emptyResults');
      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('handles large datasets with batch pagination', () => {
      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: 5000,
        pageSize: 100,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@batchPage1');
      cy.get('[aria-label="rules-table"]').should('exist');
      cy.get('#overview-dashbar').should('exist');
    });

    it('refetches with batch requests after overview card click', () => {
      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: 100,
        pageSize: 50,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@batchPage1');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('Critical recommendations')
          .closest('[data-ouia-component-type]')
          .click();
      });

      cy.wait('@batchPage1');
      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('handles sequential batch operations when applying and clearing filters', () => {
      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: 150,
        pageSize: 50,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@batchPage1');

      cy.get('[data-ouia-component-id="ConditionalFilter"]')
        .find('input')
        .type('test{enter}');
      cy.wait('@batchPage1');

      cy.get('button').contains('Reset filters').click();
      cy.wait('@batchPage1');

      cy.get('[aria-label="rules-table"]').should('exist');
    });

    it('handles batch requests for pathways tab', () => {
      cy.intercept('GET', '**/api/insights/v1/rule/*', {
        statusCode: 200,
        body: recommendations,
      }).as('getRecommendations');

      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/pathway/',
        total: 200,
        pageSize: 50,
        dataType: 'pathways',
        paginationType: 'offset',
      });

      mountComponent();
      cy.wait('@getRecommendations');

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@batchPage1');

      cy.get('table[aria-label="pathways-table"]').should('exist');
    });

    it('preserves overview dashboard during batch operations', () => {
      cy.setupBatchInterceptors({
        url: '**/api/insights/v1/rule/',
        total: 200,
        pageSize: 50,
        dataType: 'recommendations',
        paginationType: 'offset',
      });

      cy.intercept('GET', '/api/insights/v1/pathway/*', {
        statusCode: 200,
        body: pathways,
      }).as('getPathways');

      mountComponent();
      cy.wait('@batchPage1');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
      });

      cy.contains('[role="tab"]', 'Pathways').click();
      cy.wait('@getPathways');

      cy.get('#overview-dashbar').within(() => {
        cy.contains('3').should('exist');
        cy.contains('5').should('exist');
      });

      cy.contains('[role="tab"]', 'Recommendations').click();

      cy.get('[aria-label="rules-table"]', { timeout: 5000 }).should('exist');
      cy.get('#overview-dashbar').should('exist');
    });
  });
});
