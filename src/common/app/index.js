// The main app running the show.

'use strict';
const Vue = require('vue');
const ui = require('../../ui');
const { repairFormats } = require('../../data/actions');
const store = require('../../data/store');

module.exports = Vue.extend({
	template: '<div><router-view></router-view></div>',

	ready() {
		ui.init();
		this.repairFormats();
	},

	vuex: {
		actions: { repairFormats }
	},

	store
});
