const { defineConfig } = require('cypress');
const { devServer } = require('@cypress/webpack-dev-server');
const webpackConfig = require('./config/cypress.webpack.config.js');
const codeCoverageTask = require('@cypress/code-coverage/task');

module.exports = defineConfig({
  viewportWidth: 1000,
  viewportHeight: 660,
  video: false,
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        webpackConfig,
      });
    },
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
