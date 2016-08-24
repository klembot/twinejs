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
		document.body.classList.add(`theme-${this.themePref}`);
	},

	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},

	vuex: {
		actions: { repairFormats },
		getters: {
			themePref: state => state.pref.appTheme
		}
	},

	store
});
