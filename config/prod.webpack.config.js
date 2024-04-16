/* global */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const path = require('path');
const webpack = require('webpack');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  sassPrefix: '.advisor, .inventory',
  debug: true,
  ...(process.env.BETA === 'true' && { deployment: 'beta/apps' }),
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      shared: [
        {
          'react-router-dom': { singleton: true, requiredVersion: '*' },
        },
      ],
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry'),
        './SystemDetail': resolve(__dirname, '../src/Modules/SystemDetail'),
      },
    },
    ...(process.env.SENTRY_AUTH_TOKEN
      ? sentryWebpackPlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PPROJECT,
        })
      : {})
  )
);

const SourceMapsPlugin = new webpack.SourceMapDevToolPlugin({
  test: /\.js/i,
  exclude: /(node_modules|bower_components)/i,
  filename: `sourcemaps/[name].js.map`,
});

plugins.push(SourceMapsPlugin);

module.exports = () => {
  const CopyFilesWebpackPlugin = new (require('copy-webpack-plugin'))({
    patterns: [
      { from: path.resolve(__dirname, '../static/drf-yasg'), to: 'drf-yasg' },
      {
        from: path.resolve(__dirname, '../static/rest_framework'),
        to: 'rest_framework',
      },
    ],
  });
  'source-map', // Source map generation must be turned on
    plugins.push(CopyFilesWebpackPlugin);

  return { ...webpackConfig, plugins };
};
