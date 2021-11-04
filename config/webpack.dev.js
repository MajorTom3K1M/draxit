const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const helpers = require('./helpers');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      app: [helpers.root('client/app/index.js'), 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false'],
      hot: 'webpack/hot/dev-server.js',
    },
    output: {
        filename: 'js/[name].js',
        chunkFilename: '[id].chunk.js',
    },
    devServer: {
        contentBase: helpers.root('client/public'),
        historyApiFallback: true,
        hot: true,
        stats: 'minimal'
    },
})