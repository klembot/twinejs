const Vue = require('vue');
const locale = require('../../locale');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
		origin: null
	}),

	template: require('./index.html'),

	computed: {
		gplText() {
			return locale.say(
				`This application is released under the <a href="http://www.gnu.org/licenses/gpl-3.0.html">GPL v3</a> license, but any work created with it may be released under any terms, including commercial ones.`
			);
		},
		fontsText() {
			return locale.say(
				`Source Sans Pro and Source Code Pro were designed by Paul D. Hunt under the guidance of Robert Slimbach for <a href="http://adobe.com/">Adobe</a><br> Nunito was designed by <a href="http://code.newtypography.co.uk/">Vernon Adams</a>`
			);
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	},

	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
