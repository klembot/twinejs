require('./index.less');

/*
The main entry point for the application.
*/

let Vue = require('vue');

/*
Load Vue extensions as early as possible so that they're available to
everything.
*/

const localeFilters = require('./vue/filters/locale');
const mountMixin = require('./vue/mixins/mount-to');
const mouseScrollingDirective = require('./vue/directives/mouse-scrolling');

Vue.mixin(mountMixin);
localeFilters.addTo(Vue);
mouseScrollingDirective.addTo(Vue);

/*
We initialize our NW.js hooks as early as possible. This needs to be after we
extend Vue, because it touches certain Vue components that expect those
extensions to be in place at require() time.
*/

require('./nw').init().then(function() {
	const locale = require('./locale');
	const notify = require('./ui/notify');
	const store = require('./data/store');
	const TwineApp = require('./common/app');
	const TwineRouter = require('./common/router');

	require('core-js');

	/* Start the application after loading the appropriate locale data. */

	let userLocale;

	/*
	The user can specify a locale parameter in the URL to override the app
	preference, in case things go severely wrong and they need to force it.
	*/

	const localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch) {
		userLocale = localeUrlMatch[1];
	}
	else {
		userLocale = store.state.pref.locale;
	}

	if (typeof userLocale === 'string') {
		/* Load the locale, then start the application. */

		locale.load(userLocale.toLowerCase(), () => {
			TwineRouter.start(TwineApp, '#main');
		});
	}
	else {
		/*
		Something has gone pretty wrong; fall back to English as a last resort.
		*/

		locale.load('en', () => {
			TwineRouter.start(TwineApp, '#main');

			Vue.nextTick(() => {
				/*
				The message below is not localized because if we've reached
				this step, localization is not working.
				*/

				notify(
					'Your locale preference has been reset to English due ' +
					'to a technical problem.<br>Please change it with the ' +
					'<b>Language</b> option in the story list.',
					'danger'
				);
			});
		});
	}
});