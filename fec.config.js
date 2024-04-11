const { resolve, path } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const CopyFilesWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  appUrl: '/insights/advisor',
  debug: true,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: true,
  sassPrefix: 'advisor, inventory',
  plugins: [
    process.env.SENTRY_AUTH_TOKEN &&
      sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
    CopyFilesWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../static/drf-yasg'), to: 'drf-yasg' },
        {
          from: path.resolve(__dirname, '../static/rest_framework'),
          to: 'rest_framework',
        },
      ],
    }),
  ],
  ...(process.env.HOT
    ? { hotReload: process.env.HOT === 'true' }
    : { hotReload: true }),
  ...(process.env.port ? { port: parseInt(process.env.port) } : {}),
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
  },
  exposes: {
    './RootApp': resolve(__dirname, '../src/AppEntry'),
    './SystemDetail': resolve(__dirname, '../src/Modules/SystemDetail'),
  },
};
