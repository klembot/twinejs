'use strict';
let webpackConfig = require('./webpack.config.js');

/*
Clear entry point re:
http://mike-ward.net/2015/09/07/tips-on-setting-up-karma-testing-with-webpack/.
*/

webpackConfig.entry = {};

/* Add Babel loader since PhantomJS doesn't speak ES6. */

webpackConfig.module.loaders.push({
	test: /\.js$/,
	exclude: /node_modules/,
	loader: 'babel-loader',
	query: {
		presets: ['es2015']
	}
});

module.exports = function(config) {
	config.set({
		browsers: ['PhantomJS'],
		files: ['src/**/*.spec.js'],
		frameworks: ['mocha'],
		preprocessors: { 'src/**/*.spec.js': ['webpack'] },
		singleRun: true,
		webpack: webpackConfig,
		webpackMiddleware: { noInfo: true }
	});
};
