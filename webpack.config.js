const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PoPlugin = require('./webpack/po-webpack-plugin');
const Autoprefixer = require('less-plugin-autoprefix');
const package = require('./package.json');

const isRelease = process.env.NODE_ENV === 'production';
const useCdn = process.env.USE_CDN === 'y';
const useElectron = process.env.USE_ELECTRON === 'y';

const config = (module.exports = {
	mode: isRelease ? 'production' : 'development',
	entry: './src/index.js',
	target: useElectron ? 'electron-renderer' : 'web',
	output: {
		path: path.join(
			__dirname,
			'dist',
			useCdn ? 'web-cdn' : useElectron ? 'web-electron' : 'web'
		),
		filename: 'twine.js'
	},
	module: {
		rules: [
			/*
			Inline resources below 10k in size.
			*/
			{
				test: /\.(eot|png|svg|ttf|woff|woff2)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'rsrc/[name].[hash].[ext]'
				}
			},

			/*
			We must exclude the top-level template, as I think the HTML plugin
			is expecting a string as output, not a function.
			*/
			{
				test: /\.ejs$/,
				exclude: /index\.ejs$/,
				loader: 'ejs-webpack-loader'
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				test: /\.less$/,
				use: [
					{loader: MiniCssExtractPlugin.loader},
					{loader: 'css-loader', options: {minimize: isRelease}},
					{
						loader: 'less-loader',
						options: {
							plugins: [
								new Autoprefixer({
									browsers: package.browserslist.split(', ')
								})
							]
						}
					}
				]
			}
		]
	},
	plugins: [
		new CopyPlugin([
			{from: 'src/common/img/favicon.ico', to: 'rsrc/favicon.ico'},
			{from: 'icons/ios-icon-180.png', to: 'rsrc/ios-icon-180.png'},
			{from: 'story-formats/', to: 'story-formats/'},
			{from: 'src/locale/view/img', to: 'rsrc/'},
			{from: 'src/locale/po/*.js', to: 'locale/'}
		]),
		new HtmlPlugin({
			template: './src/index.ejs',
			package: package,
			buildNumber: require('./scripts/build-number').number,
			inject: false,
			minify: isRelease && {collapseWhitespace: true},
			cdn: useCdn
		}),
		new MiniCssExtractPlugin({filename: 'twine.css'}),
		new PoPlugin({
			src: 'src/locale/po/*.po',
			dest: 'locale',
			options: {
				format: 'jed1.x',
				domain: 'messages'
			}
		})
	],
	devServer: {
		stats: 'minimal'
	}
});

if (isRelease) {
	/*
	Transpile JS to our target platforms.
	*/

	config.module.rules.push({
		test: /\.js$/,
		exclude: /node_modules/,
		loader: 'babel-loader',
		options: {presets: ['@babel/preset-env']}
	});
}

if (useCdn) {
	config.externals = {
		codemirror: 'CodeMirror',
		/*
		core-js has no external interface, so we borrow an existing global
		property.
		*/
		'core-js': 'location',
		fastclick: 'FastClick',
		jed: 'Jed',
		jszip: 'JSZip',
		moment: 'moment',
		'svg.js': 'SVG',
		'tether-drop': 'Drop',
		vue: 'Vue',
		'vue-router': 'VueRouter',
		vuex: 'Vuex'
	};
}
