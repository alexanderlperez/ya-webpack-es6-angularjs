'use strict';

const Path = require('path')
const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractSASS = new ExtractTextPlugin('styles/bundle.css');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (options) => {

    let webpackConfig = {
        devtool: options.devtool,
        // dev entry-point, prod. later in env-related conditional
        entry: [
            `webpack-dev-server/client?http://localhost:${options.port}`,
            'webpack/hot/dev-server',
            './src/scripts/app'
        ],
        output: {
            path: Path.join(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        plugins: [
            new Webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(options.isProduction ? 'production' : 'development')
                }
            }),
            new HtmlWebpackPlugin({
                template: './src/index.ejs' // HtmlWebpackPlugin has EJS compilation built in
            }),
            new Webpack.ProvidePlugin({ 
                // bootstrap 3 dependencies
                $: 'jquery', 
                jQuery: 'jquery', 
                'window.jQuery': 'jquery', 
                'Tether': 'tether',
                Popper: ['popper.js', 'default'], 
            }),
            new CopyWebpackPlugin([ 
                // ready for static assets
            ])
        ],
        module: {
            loaders: [
                { test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel', query: { presets: ['es2015'] } },
                { test: /\.json$/, loader: "json-loader"  },
                { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/, loader: 'file-loader' }
            ]
        }
    };

    if (options.isProduction) {
        webpackConfig.entry = ['./src/scripts/app'];

        webpackConfig.plugins.push(
            new Webpack.optimize.OccurenceOrderPlugin(),
            new Webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                }
            }),
            ExtractSASS
        );

        webpackConfig.module.loaders.push({
            test: /\.scss$/i,
            loader: ExtractSASS.extract(['css', 'sass'])
        });
    } else {
        webpackConfig.plugins.push(
            new Webpack.HotModuleReplacementPlugin()
        );

        webpackConfig.module.loaders.push({
            test: /\.scss$/i,
            loaders: ['style', 'css', 'sass']
        });

        webpackConfig.devServer = {
            contentBase: './dist',
            hot: true,
            port: options.port,
            inline: true,
            progress: true
        };
    }

    return webpackConfig;
}
