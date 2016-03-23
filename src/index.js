// bootstrap app after loading localization, if any

require('es6-promise');
const _ = require('underscore');
const locale = require('./locale');
const notify = require('./ui/notify');
const AppPref = require('./data/models/app-pref');
const TwineApp = require('./common/app');

// Vue setup

const Vue = require('vue');
Vue.filter('say', locale.say.bind(locale));

((() => {
	let userLocale;

	window.app = new TwineApp();

	// URL parameter locale overrides everything

	const localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch) {
		userLocale = localeUrlMatch[1];
	}
	else {
		// use app preference; default to best guess
		// http://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser

		const localePref = AppPref.withName(
			'locale',
			window.navigator.userLanguage ||
			window.navigator.language ||
			window.navigator.browserLanguage ||
			window.navigator.systemLanguage ||
			'en-us'
		);

		userLocale = localePref.get('value');
	}

	if (typeof userLocale == 'string') {
		locale.load(userLocale.toLowerCase(), () => {
			window.app.start();
		});
	}
	else {
		locale.load('en', () => {
			window.app.start();
			_.defer(() => {
				// not localized because if we've reached this step,
				// localization isn't working
				notify(
					'Your locale preference has been reset to English due ' +
					'to a technical problem.<br>Please change it with the ' +
					'<b>Language</b> option in the story list.', 'danger');
			});
		});
	}
}))();
