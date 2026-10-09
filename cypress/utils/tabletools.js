import _ from 'lodash';
import { checkRowCounts } from '@redhat-cloud-services/frontend-components-utilities';

export const RULES_TABLE_ROOT = 'table[data-ouia-component-id=rules-table]';

/**
 * Waits for TableTools component to finish loading and achieve stable state
 * @param {string} rootSelector - OUIA selector for the table
 * @param {string} networkAlias - Intercept alias for the primary data endpoint
 */
export const waitForTableTools = (
  rootSelector = RULES_TABLE_ROOT,
  networkAlias = '@getRules',
) => {
  if (networkAlias) {
    cy.wait(networkAlias);
  }
  cy.get('[aria-label="Loading"]', { timeout: 10000 }).should('not.exist');
  cy.get(`${rootSelector}[data-ouia-safe="true"]`, { timeout: 10000 }).should(
    'exist',
  );
};

/**
 * Expands all rows in a TableTools table and verifies row count expansion
 * @param {number} rowCount - Base row count before expansion
 */
export const expandAllRows = (rowCount = 20) => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
  checkRowCounts(rowCount * 2);
  cy.get('thead th button[aria-label="Expand all rows"]').should(
    'have.attr',
    'aria-expanded',
    'true',
  );
};

/**
 * Collapses all rows in a TableTools table and verifies row count reduction
 * @param {number} rowCount - Expected row count after collapse
 */
export const collapseAllRows = (rowCount = 20) => {
  cy.get('thead th button[aria-label="Expand all rows"]').click();
  checkRowCounts(rowCount);
  cy.get('thead th button[aria-label="Expand all rows"]').should(
    'have.attr',
    'aria-expanded',
    'false',
  );
};

/**
 * Validates header text for TableTools columns
 * @param {string[]} expectedHeaders - Ordered list of expected column titles
 * @param {string} rootSelector - OUIA selector for the table
 */
export const checkTableToolsHeaders = (
  expectedHeaders,
  rootSelector = RULES_TABLE_ROOT,
) => {
  cy.get(`${rootSelector} th[scope="col"]`)
    .then(($els) =>
      _.map(Cypress.$.makeArray($els), 'innerText')
        .map((text) => text.trim())
        .filter(Boolean),
    )
    .should('deep.equal', expectedHeaders);
};

/**
 * Maps risk badge indicator color classes to numeric total risk levels
 * pf-m-red: Critical (4)
 * pf-m-orange: Important (3)
 * pf-m-yellow: Moderate (2)
 * pf-m-blue: Low (1)
 */
const RISK_CLASS_TO_LEVEL = {
  'pf-m-red': 4,
  'pf-m-orange': 3,
  'pf-m-yellow': 2,
  'pf-m-blue': 1,
};

/**
 * Validates that rendered rows in a TableTools table are sorted by total risk in specified direction
 * @param {'descending'|'ascending'} order - Expected sort order
 * @param {string} rootSelector - OUIA selector for the table
 */
export const checkTotalRiskRowOrder = (
  order = 'descending',
  rootSelector = RULES_TABLE_ROOT,
) => {
  cy.get(`${rootSelector} tbody td[data-label="Total risk"]`)
    .then(($cells) => {
      return Cypress.$.makeArray($cells).map((cell) => {
        const badge = cell.querySelector('.pf-v6-c-label, .pf-m-red, .pf-m-orange, .pf-m-yellow, .pf-m-blue');
        if (!badge) return 0;
        for (const [cls, level] of Object.entries(RISK_CLASS_TO_LEVEL)) {
          if (badge.classList.contains(cls)) return level;
        }
        return 0;
      });
    })
    .then((riskLevels) => {
      const sorted = [...riskLevels].sort((a, b) =>
        order === 'descending' ? b - a : a - b,
      );
      expect(riskLevels).to.deep.equal(sorted);
    });
};

