const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const CdnPlugin = require('webpack-cdn-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PoPlugin = require('./webpack/po-webpack-plugin');
const Autoprefixer = require('less-plugin-autoprefix');
const pkg = require('./package.json');

const isRelease = process.env.NODE_ENV === 'production';
const useElectron = process.env.USE_ELECTRON === 'y';

process.traceDeprecation = true;

const config = (module.exports = {
	mode: isRelease ? 'production' : 'development',
	entry: './src/index.js',
	target: useElectron ? 'electron-renderer' : 'web',
	output: {
		path: path.join(
			__dirname,
			'dist',
			useElectron ? 'web-electron' : isRelease ? 'web-cdn' : 'web'
		),
		filename: 'twine.js',
		publicPath: process.env.WEBPACK_PUBLIC_PATH
	},
	resolve: {
		alias: {
			'twine-vuex-persistence$': useElectron
				? '../file-system'
				: '../local-storage',
			vue$: 'vue/dist/vue.common.js',
			'vue-router$': 'vue-router/dist/vue-router.common.js'
		}
	},
	devtool: 'source-map',
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
									browsers: pkg.browserslist.split(', ')
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
			{from: 'story-formats/', to: 'story-formats/'},
			{from: 'src/locale/view/img', to: 'rsrc/'},
			{from: 'src/locale/po/*.js', to: 'locale/'}
		]),
		new HtmlPlugin({
			template: './src/index.ejs',
			package: pkg,
			hash: true,
			buildNumber: require('./scripts/build-number').number
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
	/* Transpile JS to our target platforms. */

	config.module.rules.push({
		test: /\.js$/,
		exclude: /node_modules/,
		loader: 'babel-loader',
		resolve: {
			alias: {
				vue$: 'vue/dist/vue.common.js',
				'vue-router$': 'vue-router/dist/vue-router.common.js'
			}
		},
		options: {presets: ['@babel/preset-env']}
	});

	/* Use CDN references. */

	config.plugins.push(
		new CdnPlugin({
			modules: [
				{
					name: 'codemirror',
					var: 'CodeMirror'
				},
				{
					name: 'fastclick',
					var: 'FastClick'
				},
				{
					name: 'jed',
					var: 'Jed'
				},
				{
					name: 'jszip',
					var: 'JSZip',
					path: 'jszip.min.js',
					prodUrl: '//cdnjs.cloudflare.com/ajax/libs/:name/:version/:path'
				},
				{
					name: 'tether'
				},
				{
					name: 'tether-drop',
					var: 'Drop'
				},
				{
					name: 'moment'
				},
				{
					name: 'vue',
					var: 'Vue',
					path: 'dist/vue.min.js'
				},
				{
					name: 'vue-router',
					var: 'VueRouter',
					path: 'dist/vue-router.min.js'
				},
				{
					name: 'vuex',
					var: 'Vuex',
					path: 'dist/vuex.min.js'
				},
				{name: 'font-awesome', var: 'fa', cssOnly: true}
			],
			prod: isRelease
		})
	);
}
