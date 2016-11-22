const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const PoPlugin = require('./webpack/po-webpack-plugin');
const Autoprefixer = require('less-plugin-autoprefix');
const package = require('./package.json');

module.exports = {
	entry: './src/index.js',
	output: {
		path: 'build/',
		filename: 'twine.js'
	},
	module: {
		loaders: [
			/*
			Inline any resurces below 10k in size.
			*/
			{ test: /\.(eot|png|svg|ttf|woff|woff2)(\?.*)?$/, loader: 'url-loader?limit=10000&name=rsrc/[name].[hash].[ext]' },
			/*
			We must exclude the top-level template, as I think the HTML plugin
			is expecting a string as output, not a function.
			*/
			{ test: /\.ejs$/, exclude: /index\.ejs$/, loader: 'ejs' },
			{ test: /\.html$/, loader: 'raw' },
			{ test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
			{ test: /\.json$/, loader: 'json' }
		],
	},
	lessLoader: {
		lessPlugins: [
			new Autoprefixer({ browsers: ['iOS 1-9', 'last 2 versions'] })
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
		new CopyPlugin([{ from: 'src/dialogs/app-donation/klimas.png', to: 'rsrc/' }]),
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
