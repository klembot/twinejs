var nodeExternals = require('webpack-node-externals');
var config = require('./webpack.config');

/* Recommended setup from http://zinserjan.github.io/mocha-webpack/docs/installation/webpack-configuration.html. */

config.target = 'node';
config.externals = [nodeExternals()];
config.plugins = [];

module.exports = config;
