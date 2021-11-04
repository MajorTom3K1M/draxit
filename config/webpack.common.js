const helpers = require('./helpers');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: helpers.root('client/app/index.js')
    },
    output: {
        path: helpers.root('dist'),
        publicPath: '/',
    },
    resolve: {
      extensions: ['.js', '.json', '.css', '.scss', '.html'],
      alias: {
        app: 'client/app',
      },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: helpers.root('client'),
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
              },
            // Load fonts
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/',
                    publicPath: url => `../fonts/${url}`
                }
                }]
            }
        ]
    },
    plugins:[
        new htmlWebpackPlugin({
            template: helpers.root("client/public/index.html"),
            inject: 'body'
        }),
        new webpack.HotModuleReplacementPlugin(),

    ]
}