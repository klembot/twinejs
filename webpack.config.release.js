const UglifyPlugin = require('webpack').optimize.UglifyJsPlugin;
const CleanPlugin = require('less-plugin-clean-css');
var config = require('./webpack.config');

config.output.path = 'dist/web';

/* Transpile down to ES5. */

config.module.loaders.push({
	test: /\.js$/,
	exclude: /node_modules/,
	loader: 'babel-loader',
	query: {
		presets: ['es2015']
	}
});

/* Minify the JS. */

config.plugins.push(new UglifyPlugin({ minimize: true }));

/* Minify the CSS. */

config.lessLoader.lessPlugins.push(new CleanPlugin());

module.exports = config;
