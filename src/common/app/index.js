// The main app running the show.

'use strict';
const Vue = require('vue').default;
const ui = require('../../ui');
const { repairFormats } = require('../../data/actions/story-format');
const { repairStories } = require('../../data/actions/story');
const store = require('../../data/store');
const router = require('../router');

module.exports = Vue.extend({
	router: router,
	template: '<div><router-view></router-view></div>',

	mounted() {
		this.$nextTick(function () {
			// code that assumes this.$el is in-document
			ui.init();
			this.repairFormats();
			this.repairStories();
			document.body.classList.add(`theme-${this.themePref}`);
		  });
	},

	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},

	vuex: {
		actions: { repairFormats, repairStories },
		getters: {
			themePref: state => state.pref.appTheme
		}
	},

	store
});
