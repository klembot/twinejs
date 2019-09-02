const pkg = require('./package.json');

module.exports = {
	chainWebpack: config => {
		config.plugin('html').tap(args => {
			args[0].package = pkg;
			args[0].buildNumber = 'FIXME-BUILD-NUMBER';
			return args;
		});
	},
	configureWebpack: {
		module: {
			rules: [
				{
					test: /\.md$/i,
					use: ['html-loader', 'markdown-loader']
				}
			]
		}
	},
	pluginOptions: {
		i18n: {
			locale: 'en-us',
			fallbackLocale: 'en-us',
			localeDir: 'locales',
			enableInSFC: true
		}
	}
};
