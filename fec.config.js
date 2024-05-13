const { resolve } = require('path');

module.exports = {
  appUrl: '/insights/advisor',
  debug: true,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: true,
  plugins: [],
  ...(process.env.port ? { port: parseInt(process.env.port) } : {}),
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
  },
  exposes: {
    './RootApp': resolve(__dirname, '../src/AppEntry'),
    './SystemDetail': resolve(__dirname, '../src/Modules/SystemDetail'),
  },
};
