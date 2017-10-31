const UglifyPlugin = require('webpack').optimize.UglifyJsPlugin;
const CleanPlugin = require('less-plugin-clean-css');
var config = require('./webpack.config');

delete config.devtool;
config.output.path = __dirname + '/dist/web';

/* Transpile down to ES5. */

config.module.rules.push({
	test: /\.js$/,
	exclude: /node_modules/,
	loader: 'babel-loader',
	options: {
		presets: ['es2015']
	}
});

/*
Base64 encode all fonts to work around a bug in NW.js -- see
https://github.com/nwjs/nw.js/issues/5080
*/

config.module.rules.splice(0, 1);

config.module.rules.push({
	test: /\.(png|svg)(\?.*)?$/,
	loader: 'url-loader',
	options: {
		limit: 10000,
		name: 'rsrc/[name].[hash].[ext]'
	}
});

config.module.rules.push({
	test: /\.(woff|woff2|ttf|eot|svg)(\?.*)?$/,
	exclude: /img/,
	loader: 'base64-font-loader'
});

/* Minify the JS. */

config.plugins.push(new UglifyPlugin({ minimize: true }));

/* Minify the CSS. */

//config.lessLoader.lessPlugins.push(new CleanPlugin());

module.exports = config;
