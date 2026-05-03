export const pdfReportInterceptors = {
  'successful with pdf blob': () =>
    cy
      .intercept('POST', /\/api\/crc-pdf-generator\/v1\/generate.*/, {
        statusCode: 200,
        body: ['pdf-blob'],
      })
      .as('generateReport'),
};

/**
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
