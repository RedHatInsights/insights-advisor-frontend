export const pdfReportInterceptors = {
  'successful with pdf blob': () =>
    cy
      .intercept('POST', /\/api\/crc-pdf-generator\/v1\/generate.*/, {
        statusCode: 200,
        body: ['pdf-blob'],
      })
      .as('generateReport'),
};
