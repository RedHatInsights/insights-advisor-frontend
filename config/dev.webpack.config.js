/* global */
const { resolve } = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('@redhat-cloud-services/frontend-components-config');

const chromeEnv = process.env.CHROME_ENV
  ? process.env.CHROME_ENV
  : 'stage-stable';
const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};
const LOCAL_INVENTORY_FRONTEND = !!process.env.INVENTORY_FRONTEND_PORT;
const INVENTORY_FRONTEND_HOST = 'stage.foo.redhat.com';
const INVENTORY_FRONTEND_PORT = '8003';

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  appUrl: process.env.BETA
    ? ['/preview/insights/advisor', '/beta/insights/advisor']
    : ['/insights/advisor'],
  env: process.env.CHROME_ENV
    ? process.env.CHROME_ENV
    : process.env.BETA
    ? 'stage-beta'
    : 'stage-stable', // pick chrome env ['stage-beta', 'stage-stable', 'prod-beta', 'prod-stable']
  useProxy: true,
  proxyVerbose: true,
  routes: {
    ...(LOCAL_INVENTORY_FRONTEND && {
      '/apps/inventory': {
        host: `http://${INVENTORY_FRONTEND_HOST}:${INVENTORY_FRONTEND_PORT}`,
      },
      '/beta/apps/inventory': {
        host: `http://${INVENTORY_FRONTEND_HOST}:${INVENTORY_FRONTEND_PORT}`,
      },
    }),
  },
  customProxy: [
    // {
    //   context: (path) => path.includes('/api/'),
    //   target: chromeEnv.startsWith('stage') ? 'https://console.stage.redhat.com/' : 'https://console.redhat.com/',
    //   secure: true,
    //   changeOrigin: true,
    //   autoRewrite: true,
    //   ws: true,
    //   onProxyReq: function (request) {
    //     request.setHeader('origin', chromeEnv.startsWith('stage') ? 'https://console.stage.redhat.com/' : 'https://console.redhat.com/');
    //   },
    // },
  ],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  sassPrefix: '.advisor, .inventory',
  useFileHash: false,
  env: chromeEnv, // pick chrome env ['stage-beta', 'stage-stable', 'prod-beta', 'prod-stable']
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
  exposes: {
    './RootApp': resolve(__dirname, '../src/DevEntry'),
  },
  localChrome: process.env.INSIGHTS_CHROME,
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
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
