/* global */
const { resolve } = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  env: process.env.BETA ? 'ci-beta' : 'ci-stable',
  useProxy: true,
  useCloud: true,
  appUrl: process.env.BETA ? ['/beta/insights/advisor'] : ['/insights/advisor'],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
  exposes: {
    './RootApp': resolve(__dirname, '../src/DevEntry'),
  },
  env: 'prod',
  localChrome: process.env.INSIGHTS_CHROME,
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry'),
        './SystemDetail': resolve(
          __dirname,
          '../src/SmartComponents/SystemAdvisor'
        ),
        './AdvisorReportDetails': resolve(
          __dirname,
          '../src/PresentationalComponents/ReportDetails'
        ),
      },
    }
  )
);

module.exports = (env) => {
  env && env.analyze === 'true' && plugins.push(new BundleAnalyzerPlugin());

  return { ...webpackConfig, plugins };
};
