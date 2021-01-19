/* global require, module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const path = require('path');

const { config: webpackConfig, plugins } = config({ rootFolder: resolve(__dirname, '../'), debug: true });

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../')
    })
);

module.exports = () => {
    const CopyFilesWebpackPlugin = new(require('copy-webpack-plugin'))({
        patterns: [
            { from: path.resolve(__dirname, '../static/drf-yasg'), to: 'drf-yasg' },
            { from: path.resolve(__dirname, '../static/rest_framework'), to: 'rest_framework' }]
    });
    plugins.push(CopyFilesWebpackPlugin);

    return { ...webpackConfig, plugins };
};
