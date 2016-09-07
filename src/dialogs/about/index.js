const Vue = require('vue');

module.exports = Vue.extend({
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
