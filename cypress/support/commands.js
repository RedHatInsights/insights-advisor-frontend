// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add(
  'ouiaId',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-id="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  },
);

Cypress.Commands.add(
  'ouiaType',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-type="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  },
);

Cypress.Commands.add('clickOnRowKebab', (name) => {
  cy.contains('tbody [data-ouia-component-type="PF6/TableRow"]', name)
    .find('.pf-v6-c-menu-toggle')
    .click();
});

Cypress.Commands.add('tableIsSortedBy', (columnTitle, direction = null) => {
  if (direction) {
    return cy
      .get('th')
      .contains(columnTitle)
      .closest('th')
      .should('have.class', 'pf-v6-c-table__sort')
      .and('have.class', 'pf-m-selected')
      .and('have.attr', 'aria-sort', direction);
  }

  return cy
    .get('th')
    .contains(columnTitle)
    .closest('th')
    .should('have.class', 'pf-v6-c-table__sort')
    .and('have.class', 'pf-m-selected');
});

/**
 * Helper function to generate mock recommendations data (non-Cypress function)
 */
window.generateBatchRecommendationsData = ({
  total,
  offset,
  limit,
  template = null,
} = {}) => {
  const count = Math.min(limit, total - offset);
  const categories = [
    { id: 1, name: 'Availability' },
    { id: 2, name: 'Performance' },
    { id: 3, name: 'Stability' },
    { id: 4, name: 'Security' },
  ];

  const defaultTemplate = {
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    active: true,
    tags: 'test',
    playbook_count: 1,
    reboot_required: false,
    publish_date: '2024-01-01T00:00:00Z',
    impacted_systems_count: 5,
    reports_shown: true,
    rule_status: 'enabled',
    total_risk: 3,
    hosts_acked_count: 0,
    rating: 1,
  };

  const data = Array.from({ length: count }, (_, i) => ({
    ...(template || defaultTemplate),
    rule_id: `rule-${offset + i + 1}`,
    description: `Batch Test Rule ${offset + i + 1}`,
    impacted_systems_count: Math.floor(Math.random() * 10) + 1,
    total_risk: Math.floor(Math.random() * 4) + 1,
    category: categories[Math.floor(Math.random() * categories.length)],
    impact: {
      name: 'Test Impact',
      impact: Math.floor(Math.random() * 4) + 1,
    },
    likelihood: Math.floor(Math.random() * 4) + 1,
    resolution_set: [
      {
        system_type: 105,
        resolution: 'Test resolution',
        resolution_risk: {
          name: 'Test Resolution Risk',
          risk: Math.floor(Math.random() * 4) + 1,
        },
        has_playbook: true,
      },
    ],
  }));

  return {
    data,
    meta: {
      count: total,
      limit,
      offset,
    },
  };
};

/**
 * Generate mock data for batch request testing - Recommendations
 * @param {object} options - Configuration options
 * @param {number} options.total - Total number of items
 * @param {number} options.offset - Current offset
 * @param {number} options.limit - Items per page
 * @param {object} options.template - Template object to use for generating items
 * @returns {object} Mock response with recommendations
 */
Cypress.Commands.add('generateBatchRecommendations', (options = {}) => {
  return window.generateBatchRecommendationsData(options);
});

/**
 * Helper function to generate mock systems data (non-Cypress function)
 */
window.generateBatchSystemsData = ({
  total,
  offset = 0,
  limit = 100,
  page = 1,
  per_page = 100,
  paginationType = 'page',
} = {}) => {
  const actualOffset =
    paginationType === 'page' ? (page - 1) * per_page : offset;
  const actualLimit = paginationType === 'page' ? per_page : limit;
  const count = Math.min(actualLimit, total - actualOffset);

  const results = Array.from({ length: count }, (_, i) => ({
    id: `system-${actualOffset + i + 1}`,
    display_name: `System ${actualOffset + i + 1}`,
    updated: '2024-01-01T00:00:00Z',
  }));

  if (paginationType === 'page') {
    return {
      results,
      total,
      count,
      page,
      per_page,
    };
  }

  return {
    results,
    total,
    count,
    page: Math.floor(actualOffset / actualLimit) + 1,
    per_page: actualLimit,
  };
};

/**
 * Generate mock data for batch request testing - Systems/Hosts
 * @param {object} options - Configuration options
 * @param {number} options.total - Total number of items
 * @param {number} options.offset - Current offset (for offset pagination)
 * @param {number} options.limit - Items per page (for offset pagination)
 * @param {number} options.page - Current page (for page pagination)
 * @param {number} options.per_page - Items per page (for page pagination)
 * @param {string} options.paginationType - 'offset' or 'page'
 * @returns {object} Mock response with systems
 */
Cypress.Commands.add('generateBatchSystems', (options = {}) => {
  return window.generateBatchSystemsData(options);
});

/**
 * Helper function to generate mock pathways data (non-Cypress function)
 */
window.generateBatchPathwaysData = ({ total, offset, limit } = {}) => {
  const count = Math.min(limit, total - offset);
  const categories = [
    { id: 1, name: 'Availability' },
    { id: 2, name: 'Performance' },
    { id: 3, name: 'Stability' },
    { id: 4, name: 'Security' },
  ];

  const data = Array.from({ length: count }, (_, i) => ({
    slug: `pathway-${offset + i + 1}`,
    name: `Batch Test Pathway ${offset + i + 1}`,
    description: `Description for pathway ${offset + i + 1}`,
    component: 'test-component',
    resolution_risk: {
      name: `Pathway ${offset + i + 1}`,
      risk: Math.floor(Math.random() * 4) + 1,
    },
    publish_date: '2024-01-01T00:00:00Z',
    has_playbook: Math.random() > 0.5,
    impacted_systems_count: Math.floor(Math.random() * 20) + 1,
    reboot_required: Math.random() > 0.5,
    has_incident: Math.random() > 0.7,
    categories: [categories[Math.floor(Math.random() * categories.length)]],
    recommendation_level: Math.floor(Math.random() * 100),
    incident_count: Math.floor(Math.random() * 5),
    critical_risk_count: Math.floor(Math.random() * 5),
    high_risk_count: Math.floor(Math.random() * 10),
    medium_risk_count: Math.floor(Math.random() * 15),
    low_risk_count: Math.floor(Math.random() * 20),
  }));

  return {
    data,
    meta: {
      count: total,
      limit,
      offset,
    },
  };
};

/**
 * Generate mock data for batch request testing - Pathways
 * @param {object} options - Configuration options
 * @param {number} options.total - Total number of items
 * @param {number} options.offset - Current offset
 * @param {number} options.limit - Items per page
 * @returns {object} Mock response with pathways
 */
Cypress.Commands.add('generateBatchPathways', (options = {}) => {
  return window.generateBatchPathwaysData(options);
});

/**
 * Setup batch request interceptors for testing
 * Automatically intercepts requests and returns paginated data
 * @param {object} options - Configuration options
 * @param {string} options.url - URL pattern to intercept
 * @param {number} options.total - Total number of items
 * @param {number} options.pageSize - Items per page
 * @param {string} options.dataType - 'recommendations', 'systems', or 'pathways'
 * @param {string} options.paginationType - 'offset' or 'page'
 * @param {object} options.template - Optional template for data generation
 * @returns {void}
 */
Cypress.Commands.add(
  'setupBatchInterceptors',
  ({
    url,
    total,
    pageSize,
    dataType = 'recommendations',
    paginationType = 'offset',
    template = null,
  } = {}) => {
    const totalPages = Math.ceil(total / pageSize);

    for (let i = 0; i < totalPages; i++) {
      const offset = i * pageSize;
      const page = i + 1;

      let urlPattern, mockData;

      if (paginationType === 'offset') {
        urlPattern = `${url}*offset=${offset}*`;
      } else {
        urlPattern = `${url}*page=${page}*`;
      }

      switch (dataType) {
        case 'recommendations':
          mockData = window.generateBatchRecommendationsData({
            total,
            offset,
            limit: pageSize,
            template,
          });
          break;
        case 'systems':
          mockData = window.generateBatchSystemsData({
            total,
            offset,
            limit: pageSize,
            page,
            per_page: pageSize,
            paginationType,
          });
          break;
        case 'pathways':
          mockData = window.generateBatchPathwaysData({
            total,
            offset,
            limit: pageSize,
          });
          break;
        default:
          throw new Error(`Unknown dataType: ${dataType}`);
      }

      cy.intercept('GET', urlPattern, {
        statusCode: 200,
        body: mockData,
      }).as(`batchPage${page}`);
    }
  },
);
