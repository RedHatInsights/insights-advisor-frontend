/* global */
const { resolve } = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  exposes: {
    './RootApp': resolve(__dirname, '../src/DevEntry'),
  },
  debug: true,
  appUrl: '/insights/advisor',
  betaEnv: 'prod',
  deployment: 'apps',
  useProxy: process.env.API_ENDOINT ? true : false,
  localChrome: process.env.INSIGHTS_CHROME,
  customProxy: process.env.API_ENDOINT
    ? [
        {
          context: (path) => path.includes('/api/'),
          target: process.env.API_ENDOINT,
          secure: true,
          changeOrigin: true,
          autoRewrite: true,
          ws: true,
        },
      ]
    : [],
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
