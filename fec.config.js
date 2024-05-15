const { resolve } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  appUrl: '/insights/advisor',
  debug: true,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: true,
  plugins: [
    process.env.SENTRY_AUTH_TOKEN &&
      sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
  ],
  ...(process.env.port ? { port: parseInt(process.env.port) } : {}),
  moduleFederation: {
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
    exposes: {
      './RootApp': resolve(__dirname, 'src/AppEntry'),
      './SystemDetail': resolve(__dirname, 'src/Modules/SystemDetail'),
    },
  },
};
