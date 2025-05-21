const { resolve } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  appUrl: '/insights/advisor',
  debug: false,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: false,
  devtool: 'hidden-source-map',
  plugins: [
    // Put the Sentry Webpack plugin after all other plugins
    ...(process.env.ENABLE_SENTRY
      ? [
          sentryWebpackPlugin({
            ...(process.env.SENTRY_AUTH_TOKEN && {
              authToken: process.env.SENTRY_AUTH_TOKEN,
            }),
            org: 'red-hat-it',
            project: 'advisor-rhel',
            moduleMetadata: ({ release }) => ({
              dsn: `https://f8eb44de949e487e853185c09340f3cf@o490301.ingest.us.sentry.io/4505397435367424`,
              org: 'red-hat-it',
              project: 'advisor-rhel',
              release,
            }),
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
      './BuildExecReport': resolve(
        __dirname,
        '/src/PresentationalComponents/ExecutiveReport/BuildExecReport'
      ),
      './NewBuildExecReport': resolve(
        __dirname,
        '/src/PresentationalComponents/ExecutiveReport/NewBuildExecReport'
      ),
      './NewSystemsPdfBuild': resolve(
        __dirname,
        '/src/PresentationalComponents/Export/NewSystemsPdfBuild'
      ),
    },
  },
  _unstableSpdy: true,
};
