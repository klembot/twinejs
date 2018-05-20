/*
A toggle between light and dark themes.
*/

const Vue = require('vue').default;
const locale = require('../../locale');
const { setPref } = require('../../data/actions/pref');

module.exports = Vue.extend({
	template: require('./theme-switcher.html'),

	computed: {
		lightTitle() {
			return locale.say('Use light theme');
		},
		darkTitle() {
			return locale.say('Use dark theme');
		}

	},

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

