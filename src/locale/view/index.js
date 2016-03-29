/**
 Allows the user to pick what locale they would like to use.
**/

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const locale = require('../index');
const AppPref = require('../../data/models/app-pref');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		// The locales we offer with their codes.

		locales: [
			{ label: 'Castellano', code: 'es' },
			{ label: 'Dansk', code: 'da' },
			{ label: 'Deutsch', code: 'de' },
			{ label: 'English', code: 'en' },
			{ label: 'Fran&ccedil;ais', code: 'fr' },
			{ label: 'Nederlands', code: 'nl' },
			{ label: 'Portugu&ecirc;s Brasileiro', code: 'pt-br' },
			{ label: 'Suomi', code: 'fi' }
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
			if (typeof userLocale !== 'string') {
				// L10n: An internal error when changing locale.
				throw new Error(
					locale.say('Can\'t set locale to nonstring: %s', userLocale)
				);
			}

			AppPref.withName('locale').save({ value: userLocale });
			window.location.hash = 'stories';
			window.location.reload();
		}
	}
});
