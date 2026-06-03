export const pdfReportInterceptors = {
  'successful with pdf blob': () =>
    cy
      .intercept('POST', /\/api\/crc-pdf-generator\/v1\/generate.*/, {
        statusCode: 200,
        body: ['pdf-blob'],
      })
      .as('generateReport'),
};

export const featureFlagInterceptors = {
  kesselEnabled: () =>
    cy
      .intercept('POST', '/api/featureflags/**', {
        statusCode: 200,
        body: {
          toggles: [
            {
              name: 'advisor.kessel_enabled',
              enabled: true,
              variant: { name: 'disabled', enabled: false },
            },
          ],
        },
      })
      .as('featureFlags'),
  kesselDisabled: () =>
    cy
      .intercept('POST', '/api/featureflags/**', {
        statusCode: 200,
        body: {
          toggles: [
            {
              name: 'advisor.kessel_enabled',
              enabled: false,
              variant: { name: 'disabled', enabled: false },
            },
          ],
        },
      })
      .as('featureFlags'),
};

/**
 *
 * Feature flag interceptors for Unleash
 * @param {string[]} enabledFlags - Array of feature flag names to enable
 * @returns {Cypress.Chainable}
 */
export const featureFlagInterceptor = (enabledFlags = []) => {
  const toggles = enabledFlags.map((flagName) => ({
    name: flagName,
    enabled: true,
    variant: { name: 'enabled', enabled: true },
  }));

  return cy
    .intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: { toggles },
    })
    .as('getFeatureFlags');
};

/**
 * Smart API interceptor for RulesTable that filters fixture data based on query params
 * Matches production API behavior for filtering recommendations
 * @param {Object} fixtures - The fixture data to filter
 * @returns {Cypress.Chainable}
 */
export const rulesTableApiInterceptor = (fixtures) => {
  return cy
    .intercept('GET', '/api/insights/v1/rule/*', (req) => {
      const url = new URL(req.url);
      let filteredData = [...fixtures.data];

      // Text filter
      if (url.searchParams.get('text')) {
        const text = url.searchParams.get('text').toLowerCase();
        filteredData = filteredData.filter((item) =>
          item.description.toLowerCase().includes(text),
        );
      }

      // Array filters - total_risk, res_risk, impact, likelihood
      if (url.searchParams.has('total_risk')) {
        const risks = url.searchParams.getAll('total_risk');
        filteredData = filteredData.filter((item) =>
          risks.includes(String(item.total_risk)),
        );
      }

      if (url.searchParams.has('res_risk')) {
        const resRisks = url.searchParams.getAll('res_risk');
        filteredData = filteredData.filter((item) => {
          const resolution = item.resolution_set?.[0];
          if (!resolution) return false;
          return resRisks.includes(String(resolution.resolution_risk.risk));
        });
      }

      if (url.searchParams.has('impact')) {
        const impacts = url.searchParams.getAll('impact');
        filteredData = filteredData.filter((item) =>
          impacts.includes(String(item.impact.impact)),
        );
      }

      if (url.searchParams.has('likelihood')) {
        const likelihoods = url.searchParams.getAll('likelihood');
        filteredData = filteredData.filter((item) =>
          likelihoods.includes(String(item.likelihood)),
        );
      }

      // Category filter (uses numeric IDs)
      if (url.searchParams.has('category')) {
        const categories = url.searchParams.getAll('category');
        filteredData = filteredData.filter((item) =>
          categories.includes(String(item.category.id)),
        );
      }

      // rule_status filter
      if (url.searchParams.has('rule_status')) {
        const status = url.searchParams.get('rule_status');
        filteredData = filteredData.filter(
          (item) => item.rule_status === status,
        );
      }

      // impacting filter (systems with issues)
      if (url.searchParams.has('impacting')) {
        const impacting = url.searchParams.get('impacting') === 'true';
        if (impacting) {
          filteredData = filteredData.filter(
            (item) => item.impacted_systems_count > 0,
          );
        }
      }

      // Boolean filters - incident, has_playbook, reboot
      if (url.searchParams.has('incident')) {
        const incident = url.searchParams.get('incident') === 'true';
        filteredData = filteredData.filter(
          (item) => item.has_incident === incident,
        );
      }

      if (url.searchParams.has('has_playbook')) {
        const hasPlaybook = url.searchParams.get('has_playbook') === 'true';
        filteredData = filteredData.filter((item) => {
          const resolution = item.resolution_set?.[0];
          return resolution ? resolution.has_playbook === hasPlaybook : false;
        });
      }

      if (url.searchParams.has('reboot')) {
        const reboot = url.searchParams.get('reboot') === 'true';
        filteredData = filteredData.filter(
          (item) => item.reboot_required === reboot,
        );
      }

      // Handle pagination - if only default filters applied, use original meta count
      // Default filters: rule_status, impacting, sort, limit, offset
      const totalCount = filteredData.length;
      const defaultParams = [
        'limit',
        'offset',
        'sort',
        'rule_status',
        'impacting',
      ];
      const hasExtraFilters = Array.from(url.searchParams.keys()).some(
        (key) => !defaultParams.includes(key),
      );

      // Use original meta count if only defaults, otherwise use filtered count
      const metaCount = hasExtraFilters ? totalCount : fixtures.meta.count;

      req.reply({
        statusCode: 200,
        body: {
          ...fixtures,
          data: filteredData,
          meta: {
            ...fixtures.meta,
            count: metaCount,
          },
        },
      });
    })
    .as('getRules');
};
