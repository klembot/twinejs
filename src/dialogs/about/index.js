const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
		origin: null
	}),

	template: require('./index.html'),

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
	},

	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
