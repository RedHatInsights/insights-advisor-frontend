/* global */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const path = require('path');

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
    }
  )
);

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
  plugins.push(CopyFilesWebpackPlugin);

  return { ...webpackConfig, plugins };
};
