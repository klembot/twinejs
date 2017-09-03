var nodeExternals = require('webpack-node-externals');
var config = require('./webpack.config');

/* Recommended setup from http://zinserjan.github.io/mocha-webpack/docs/installation/webpack-configuration.html. */

config.target = 'node';
config.externals = [nodeExternals()];
config.plugins = [];

/* Disable the ExtractText plugin. */

config.module.rules.forEach(function(r) {
	if (typeof r.loader === 'object') {
		r.loader = 'null-loader';
	}
});

module.exports = config;