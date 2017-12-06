const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const PoPlugin = require('./webpack/po-webpack-plugin');
const Autoprefixer = require('less-plugin-autoprefix');
const package = require('./package.json');

module.exports = {
	entry: './src/index.js',
	output: {
		path: __dirname + '/build',
		filename: 'twine.js'
	},
	devtool: 'source-map',
	stats: 'none',
	module: {
		rules: [
			/*
			Inline any resurces below 10k in size.
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
				loader: 'ejs-loader'
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				test: /\.less$/,
				loader: ExtractTextPlugin.extract({
					use: [
						'css-loader',
						{
							loader: 'less-loader',
							options: {
								plugins: [
									new Autoprefixer({
										browsers: ['iOS 1-9', 'last 2 versions']
									})
								]
							}
						}
					]					
				})
			}
		]
	},
	/*
	Leave Node requires that are used in NW.js alone. This is apparently the
	magic invocation to do so.
	*/
	externals: {
		child_process: 'commonjs child_process',
		fs: 'commonjs fs',
		'nw.gui': 'commonjs nw.gui',
		'os': 'commonjs os',
		path: 'commonjs path',
	},
	plugins: [
		new CopyPlugin([{ from: 'src/common/img/favicon.ico', to: 'rsrc/favicon.ico' }]),
		new CopyPlugin([{ from: 'story-formats/', to: 'story-formats/' }]),
		new CopyPlugin([{ from: 'src/locale/view/img', to: 'rsrc/' }]),
		new ExtractTextPlugin('twine.css'),
		new HtmlPlugin({
			template: './src/index.ejs',
			package: package,
			buildNumber: require('./scripts/build-number'),
			inject: false
		}),
		new PoPlugin({
			src: 'src/locale/po/*.po',
			dest: 'locale',
			options: {
				format: 'jed1.x',
				domain: 'messages'
			}
		})
	]
};
