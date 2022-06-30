const webpack = require('webpack');
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  sassPrefix: '.rhell-advisor, .rhellAdvisor',
});

plugins.push(
  new webpack.DefinePlugin({ insights: { chrome: { isProd: false } } })
);

module.exports = {
  ...webpackConfig,
  plugins,
};
