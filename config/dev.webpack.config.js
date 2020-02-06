/* global require, module, __dirname */
const { resolve } = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true
});

module.exports = (env) => {
    env && env.analyze === 'true' && plugins.push(new BundleAnalyzerPlugin());

    return { ...webpackConfig, plugins };
};
