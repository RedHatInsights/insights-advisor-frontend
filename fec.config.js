const { resolve } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  appUrl: '/insights/advisor',
  debug: false,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: false,
  devtool: 'hidden-source-map',
  plugins: [
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            _experiments: {
              moduleMetadata: ({ release }) => ({
                dsn: process.env.SENTRY_INVENTORY_DSN,
                release,
              }),
            },
          }),
        ]
      : []),
  ],
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
      './RootApp': resolve(
        __dirname,
        `/src/${process.env.NODE_ENV !== 'production' ? 'Dev' : ''}AppEntry`
      ),
      './SystemDetail': resolve(__dirname, 'src/Modules/SystemDetail'),
    },
  },
};
