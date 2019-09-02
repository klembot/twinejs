/*
A toggle between light and dark themes.
*/

import Vue from 'vue';
import {say} from '../../locale';
import {setPref} from '../../data/actions/pref';
import template from './theme-switcher.html';

export default Vue.extend({
	template,
	computed: {
		lightTitle() {
			return say('Use light theme');
		},
		darkTitle() {
			return say('Use dark theme');
		}
	},
	methods: {
		setTheme(value) {
			this.setPref('appTheme', value);
		}
	},
	vuex: {
		actions: {setPref},
		getters: {
			themePref: state => state.pref.appTheme
		}
	}
});
