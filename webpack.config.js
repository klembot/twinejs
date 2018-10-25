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
			{from: 'story-formats/', to: 'story-formats/'},
			{from: 'src/locale/view/img', to: 'rsrc/'}
		]),
		new HtmlPlugin({
			template: './src/index.ejs',
			package: package,
			buildNumber: require('./scripts/build-number'),
			inject: false,
			minify: isRelease && {collapseWhitespace: true},
			options: {cdn: useCdn}
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
	stats: 'minimal'
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

	/*
	Base64 encode all fonts to work around a bug in NW.js -- see
	https://github.com/nwjs/nw.js/issues/5080
	*/

	/* Stubbing out because base64-font-loader isn't Webpack 4 compatible
	config.module.rules.push({
		test: /\.(png|svg)(\?.*)?$/,
		loader: 'url-loader',
		options: {
			limit: 10000,
			name: 'rsrc/[name].[hash].[ext]'
		}
	});

	** Don't do this is useCdn is true **

	config.module.rules.push({
		test: /\.(woff|woff2|ttf|eot|svg)(\?.*)?$/,
		exclude: /img/,
		loader: 'base64-font-loader'
	});
	*/

	config.module.rules.push({
		test: /\.(eot|png|svg|ttf|woff|woff2)(\?.*)?$/,
		loader: 'url-loader',
		options: {
			limit: 10000,
			name: 'rsrc/[name].[hash].[ext]'
		}
	});
} else {
	/*
	Inline any resurces below 10k in size; otherwise, save it to a file.
	*/
	config.module.rules.push({
		test: /\.(eot|png|svg|ttf|woff|woff2)(\?.*)?$/,
		loader: 'url-loader',
		options: {
			limit: 10000,
			name: 'rsrc/[name].[hash].[ext]'
		}
	});
}

if (useCdn) {
	Object.assign(config.externals, {
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
	});
}
