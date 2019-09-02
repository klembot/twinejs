/*
Allows the user to pick what locale they would like to use.
*/

import Vue from 'vue';
import isElectron from '../../electron/is-electron';
import {setPref} from '../../data/actions/pref';
import template from './index.html';
import './index.less';

export default Vue.extend({
	template,
	data: () => ({
		/* The locales we offer with their codes. */
		locales: [
			{label: 'Castellano', code: 'es'},
			{label: 'Catal&agrave;', code: 'ca'},
			{label: '&Ccaron;e&scaron;tina', code: 'cs'},
			{label: 'Dansk', code: 'da'},
			{label: 'Deutsch', code: 'de'},
			{label: 'English', code: 'en'},
			{label: 'Fran&ccedil;ais', code: 'fr'},
			{label: 'Italiano', code: 'it'},
			{label: 'Bahasa Melayu', code: 'ms'},
			{label: 'Nederlands', code: 'nl'},
			{label: 'Norsk bokmål', code: 'nb'},
			{label: 'Portugu&ecirc;s', code: 'pt-pt'},
			{label: 'Portugu&ecirc;s Brasileiro', code: 'pt-br'},
			{label: 'русский', code: 'ru'},
			{label: 'Suomi', code: 'fi'},
			{label: 'Svenska', code: 'sv'},
			{label: 'T&uuml;rk&ccedil;e', code: 'tr'},
			{label: '中文(简体)', code: 'zh-cn'}
		]
	}),
	methods: {
		/*
		Sets the application locale and forces a window reload
		back to the story list.
		*/

		setLocale(userLocale) {
			this.setPref('locale', userLocale);

			if (isElectron()) {
				window.twineElectron.ipcRenderer.send('app-relaunch');
			} else {
				this.$router.push('stories');
				window.location.reload();
			}
		}
	},
	vuex: {
		actions: {setPref},
		getters: {localePref: state => state.pref.locale}
	}
});
