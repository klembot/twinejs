'use strict';
let webpackConfig = require('./webpack.config.js');

/* Add Babel loader since PhantomJS doesn't speak ES6. */

webpackConfig.module.rules.push({
	test: /\.js$/,
	exclude: /node_modules/,
	loader: 'babel-loader',
	options: {
		presets: ['es2015']
	}
});

module.exports = function(config) {
	config.set({
		browsers: ['PhantomJS'],
		files: ['src/**/*.spec.js'],
		frameworks: ['mocha'],
		preprocessors: { 'src/**/*.spec.js': ['webpack'] },
		reporters: ['mocha'],
		singleRun: true,
		webpack: webpackConfig,
		webpackMiddleware: { noInfo: true }
	});
};
