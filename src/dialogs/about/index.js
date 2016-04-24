'use strict';
const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
	},
	computed: {
		buildNumber() {
			return window.app.buildNumber;
		},
		version() {
			return window.app.version;
		}
	},
});
