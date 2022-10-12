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
  resolve: {
    fallback: {
      module: false,
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      console: false,
      constants: false,
      crypto: false,
      domain: false,
      events: false,
      http: false,
      https: false,
      os: false,
      fs: false,
      path: false,
      net: false,
      punycode: false,
      process: false,
      child_process: false,
      querystring: false,
      stream: false,
      string_decoder: false,
      sys: false,
      timers: false,
      tty: false,
      url: false,
      util: false,
      vm: false,
      zlib: false,
      readline: false,
      tls: false,
    },
  },
};
