const { resolve } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  appUrl: '/insights/advisor',
  // uncomment publicPath when working in satellite env
  //publicPath: 'auto',
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
  output: {
    publicPath: 'auto',
  },
  moduleFederation: {
    exclude: ['@unleash/proxy-client-react'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
        '@unleash/proxy-client-react': {
          singleton: true,
          version: '*',
        },
      },
    ],
    exposes: {
      './RootApp': resolve(
        __dirname,
        `/src/${process.env.NODE_ENV !== 'production' ? 'Dev' : ''}AppEntry`,
      ),
      './SystemDetail': resolve(__dirname, 'src/Modules/SystemDetail'),
      './SystemDetailWrapped': resolve(
        __dirname,
        'src/Modules/SystemDetailWrapped',
      ),
      './BuildExecReport': resolve(
        __dirname,
        '/src/PresentationalComponents/ExecutiveReport/BuildExecReport',
      ),
      './NewBuildExecReport': resolve(
        __dirname,
        '/src/PresentationalComponents/ExecutiveReport/NewBuildExecReport',
      ),
      './NewSystemsPdfBuild': resolve(
        __dirname,
        '/src/PresentationalComponents/Export/NewSystemsPdfBuild',
      ),
      './SatelliteDemoComponent': resolve(
        __dirname,
        './src/Temporary/SatelliteDemoComponent.js',
      ),
      './RulesTable': resolve(
        __dirname,
        './src/PresentationalComponents/RulesTable/RulesTable.js',
      ),
      './RulesTableWrapped': resolve(
        __dirname,
        './src/PresentationalComponents/RulesTable/RulesTableWrapped.js',
      ),
      './OverviewDetails': resolve(
        __dirname,
        './src/SmartComponents/Recs/Details.js',
      ),
      './RecsDetailsWrapped': resolve(
        __dirname,
        './src/SmartComponents/Recs/RecsDetailsWrapped.js',
      ),
    },
  },
  _unstableSpdy: true,
};
