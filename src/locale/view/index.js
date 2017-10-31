/**
 Allows the user to pick what locale they would like to use.
**/

'use strict';
const Vue = require('vue');
const { setPref } = require('../../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		// The locales we offer with their codes.

		locales: [
			{ label: 'Castellano', code: 'es' },
			{ label: '&Ccaron;e&scaron;tina', code: 'cs'},
			{ label: 'Dansk', code: 'da' },
			{ label: 'Deutsch', code: 'de' },
			{ label: 'English', code: 'en' },
			{ label: 'Fran&ccedil;ais', code: 'fr' },
			{ label: 'Italiano', code: 'it' },
			{ label: 'Nederlands', code: 'nl' },
			{ label: 'Portugu&ecirc;s', code: 'pt-pt' },
			{ label: 'Portugu&ecirc;s Brasileiro', code: 'pt-br' },
			{ label: 'Suomi', code: 'fi' },
			{ label: 'Svenska', code: 'sv' },
			{ label: 'T&uuml;rk&ccedil;e', code: 'tr' }
		]
	}),

	methods: {
		/**
		 Sets the application locale and forces a window reload
		 back to the story list.

		 @method setLocale
		 @param {String} userLocale locale to set
		**/

		setLocale(userLocale) {
			this.setPref('locale', userLocale);
			window.location.hash = 'stories';
			window.location.reload();
		}
	},

	vuex: {
		actions: {
			setPref
		},

		getters: {
			localePref: state => state.pref.locale
		}
	}
});
