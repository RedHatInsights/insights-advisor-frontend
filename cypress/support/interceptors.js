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
