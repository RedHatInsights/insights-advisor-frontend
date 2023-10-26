/* global */
const { resolve } = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('@redhat-cloud-services/frontend-components-config');

const proxyConfiguration = {
  rootFolder: resolve(__dirname, '../'),
  useProxy: process.env.PROXY === 'true',
  appUrl: process.env.BETA
    ? ['/beta/insights/advisor', '/preview/insights/advisor']
    : ['/insights/advisor'],
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  env: process.env.BETA ? 'stage-beta' : 'stage-stable',
  sassPrefix: '.advisor, .inventory', // TODO: investigate if this parameter can be removed
  proxyVerbose: true,
  debug: true,
};

const { config: webpackConfig, plugins } = config(proxyConfiguration);

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

module.exports = (env) => {
  env && env.analyze === 'true' && plugins.push(new BundleAnalyzerPlugin());

  return { ...webpackConfig, plugins };
};
