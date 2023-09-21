const webpack = require('webpack');
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
});
plugins.push(
  new webpack.DefinePlugin({
    insights: {
      chrome: {
        auth: {
          getUser: () => {
            return Promise.resolve({});
          },
        },
      },
    },
  })
);

// required to mock the chrome functionss
webpackConfig.module.rules.push({
  resolve: {
    alias: {
      '@redhat-cloud-services/frontend-components/useChrome': resolve(
        __dirname,
        './overrideChrome.js'
      ),
      '../useChrome': resolve(__dirname, './overrideChrome.js'),
    },
  },
});

module.exports = {
  ...webpackConfig,
  plugins,
};
