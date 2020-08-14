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
} else {
	userLocale = store.state.pref.locale;
}

if (typeof userLocale === 'string') {

	/* Keep the locale in the DOM as an attribute of <HTML>, so localized styling will be easier */
	/* It's specially useful in case of RTL languages such as Farsi, Persian, Arabic, Hebrew, etc. */
	document.getElementsByTagName("html")[0].dataset.userLocale = userLocale;

	/* Load the locale, then start the application. */

	locale.loadViaAjax(userLocale.toLowerCase()).then(() => {
		TwineRouter.start(TwineApp, '#main');
	});
} else {
	/*
	Something has gone pretty wrong; fall back to English as a last resort.
	*/

	locale.load('en').then(() => {
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
