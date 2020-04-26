/*
Manages localization across the app, which uses vue-i18n. This automatically
adds helper functions to the main Vue instance, but there are also convenience
methods provided here for use outside of components.
*/

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import enUsLang from '@/locales/en-us.json';

Vue.use(VueI18n);

export const i18n = new VueI18n({
	fallbackLocale: 'en-us',
	lng: 'en-us',
	messages: {'en-us': enUsLang},

	/*
	vue-18n seems to generate a lot of spurious warnings. We have lint rules to
	handle this.
	*/
	silentTranslationWarn: true
});
const loadedLocales = [];

/*
Sets the application locale, loading it from a JSON file as needed. You must
call this at least once before asking for a localized message.
*/

export async function setLocale(locale) {
	function finish() {
		i18n.locale = locale;
		document.querySelector('html').setAttribute('lang', locale);
	}

	if (i18n.locale === locale) {
		return Promise.resolve();
	}

	if (loadedLocales.includes(locale)) {
		return finish();
	}

	/*
	Using string concat instead of template string because of Jest. See
	https://stackoverflow.com/a/56181618
	*/

	const messages = await import(
		/* webpackChunkName: "locale-[request]" */ '@/locales/' + locale + '.json'
	);

	i18n.setLocaleMessage(locale, messages.default);
	loadedLocales.push(locale);
	finish();
}

export const t = (...args) => i18n.t(...args);
export const tc = (...args) => i18n.tc(...args);
