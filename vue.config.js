const pkg = require('./package.json');
const path = require('path');

module.exports = {
	chainWebpack: config => {
		/*
		Force the directory components/icon-image/extra-icons to be inline,
		instead of using file-loader.
		*/
		config.module
			.rule('svg')
			.exclude.add(/src\/components\/icon-image\/extra-icons/i);

		config.module
			.rule('twine-extra-icons-svg')
			.test(/src\/components\/icon-image\/extra-icons\/.*.svg$/i)
			.use('raw-loader')
			.loader('raw-loader');

		config.plugin('html').tap(args => {
			args[0].package = pkg;
			args[0].buildNumber = 'FIXME-BUILD-NUMBER';
			return args;
		});
	},
	configureWebpack: {
		entry: path.join(__dirname, 'src/index.js'),
		module: {
			rules: [
				{
					test: /\.md$/i,
					use: ['html-loader', 'markdown-loader']
				}
				// {
				// 	test: /\.(svg)(\?.*)?$/,
				// 	use: [
				// 		{
				// 			loader: 'file-loader',
				// 			options: {
				// 				name: 'img/[name].[hash:8].[ext]'
				// 			}
				// 		}
				// 	]
				// }
			]
		}
	},
	lintOnSave: false,
	pluginOptions: {
		electronBuilder: {
			mainProcessFile: 'src/electron/index.js'
		},
		i18n: {
			locale: 'en-us',
			fallbackLocale: 'en-us',
			localeDir: 'locales',
			enableInSFC: true
		}
	}
};
