/*
A toggle between light and dark themes.
*/

const Vue = require('vue');
const { setPref } = require('../../data/actions/pref');

module.exports = Vue.extend({
	template: require('./theme-switcher.html'),

	methods: {
		setTheme(value) {
			this.setPref('appTheme', value);
		}
	},

	vuex: {
		actions: {
			setPref
		},

		getters: {
			themePref: state => state.pref.appTheme
		}
	}
});

