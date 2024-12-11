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
            org: 'red-hat-it',
            project: 'advisor-rhel',
            _experiments: {
              moduleMetadata: ({ release }) => ({
                dsn: 'https://f8eb44de949e487e853185c09340f3cf@o490301.ingest.us.sentry.io/4505397435367424',
                release,
              }),
            },
          }),
        ]
      : [
          // Justs injects the debug ids
          sentryWebpackPlugin({
            org: 'red-hat-it',
            project: 'advisor-rhel',
            _experiments: {
              moduleMetadata: ({ release }) => ({
                dsn: 'https://f8eb44de949e487e853185c09340f3cf@o490301.ingest.us.sentry.io/4505397435367424',
                release,
              }),
            },
          }),
        ]),
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
