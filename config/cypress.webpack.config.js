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

module.exports = {
  ...webpackConfig,
  plugins,
};
