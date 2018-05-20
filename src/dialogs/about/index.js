const Vue = require('vue').default;
const locale = require('../../locale');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
		origin: null
	}),

	template: require('./index.html'),

	computed: {
		gplText() {
			return locale.say(`This application is released under the \x3ca href="http:\/\/www.gnu.org/licenses/gpl-3.0.html">GPL v3\x3c/a> license, but any work created with it may be released under any terms, including commercial ones.`);
		},
		fontsText() {
			return locale.say(`Source Sans Pro and Source Code Pro were designed by Paul D. Hunt under the guidance of Robert Slimbach for \x3ca href="http:\/\/adobe.com/">Adobe\x3c/a>\x3cbr> Nunito was designed by \x3ca href="http:\/\/code.newtypography.co.uk/">Vernon Adams\x3c/a>`);
		}

	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
	},

	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
