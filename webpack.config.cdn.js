var config = require('./webpack.config.release');

config.output.path = 'dist/web-cdn';

/* Signal to the HTML that we're doing a CDN build. */

config.plugins.find(plugin => plugin.options && plugin.options.template).options.cdn = true;

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
		'jquery': 'jQuery',
		'jszip': 'JSZip',
		'moment': 'moment',
		'svg.js': 'SVG',
		'tether-drop': 'Drop',
		'underscore': '_',
		'vue': 'Vue',
		'vue-router': 'VueRouter',
		'vuex': 'Vuex'
	}
);

module.exports = config;
