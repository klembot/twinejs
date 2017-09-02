var config = require('./webpack.config.release');

config.output.path = __dirname + '/dist/web-cdn';

/* Signal to the HTML that we're doing a CDN build. */

config.plugins.find(plugin => plugin.options && plugin.options.template).options.cdn = true;

config.module.rules.pop();

config.module.rules[config.module.rules.length - 1].test =
	/\.(eot|png|svg|ttf|woff|woff2)(\?.*)?$/;

/* Externalize a bunch of dependencies. */

Object.assign(
	config.externals,
	{
		'codemirror': 'CodeMirror',
		 /*
		 core-js has no external interface, so we borrow an existing global
		 property.
		 */
		'core-js': 'location',
		'fastclick': 'FastClick',
		'jed': 'Jed',
		'jszip': 'JSZip',
		'moment': 'moment',
		'svg.js': 'SVG',
		'tether-drop': 'Drop',
		'vue': 'Vue',
		'vue-router': 'VueRouter',
		'vuex': 'Vuex'
	}
);

module.exports = config;
