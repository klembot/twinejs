/*
Manages localizing strings, dates, and times.
*/

import jsonp from 'jsonp';

import Jed from 'jed';
import moment from 'moment';

/*
The Jed instance used to localize strings.
*/
let i18n;

/*
Loads gettext strings via AJAX and sets 
*/

export function loadViaAjax(locale) {
	return new Promise(resolve => {
		/*
			If the locale is 'en' or 'en-us', return the failover data early to
			prevent unnecessary requests, especially with the online build.
			*/

		if (locale === 'en' || locale === 'en-us') {
			loadDefault();
			resolve();
			return;
		}

		/* Attempt to fetch the locale data. */

		jsonp(
			`locale/${locale}.js`,
			{name: 'locale', timeout: 1000},
			(err, data) => {
				if (err) {
					loadDefault();
					resolve();
				} else {
					loadJson(locale, data);
					resolve();
				}
			}
		);
	});
}

/*
Loads the default locale.
*/

export function loadDefault() {
	loadJson('en', {
		domain: 'messages',
		locale_data: {
			messages: {
				'': {
					domain: 'messages',
					lang: 'en-us',
					plural_forms: 'nplurals=2; plural=(n != 1);'
				}
			}
		}
	});
}

/*
Actually does setup of a locale with a name and JSON data.
*/

export function loadJson(locale, data) {
	/* Set locale in MomentJS. */

	moment.locale(locale);
	i18n = new Jed(data);
}

/*
Translates a string to the user-set locale, interpolating variables.
Anything passed beyond the source text will be interpolated into it.
*/

export function say(source, ...args) {
	try {
		if (args.length == 0) {
			return i18n.gettext(source);
		}

		/* Interpolation required. */

		return i18n.sprintf(i18n.gettext(source), ...args);
	} catch (e) {
		/*
		If all else fails, return English, even with ugly %d placeholders so
		the user can see *something*.
		*/

		return source;
	}
}

/*
Translates a string to the user-set locale, keeping in mind pluralization
rules. Any additional arguments passed after the ones listed here are
interpolated into the resulting string.

When interpolating, count will always be the first argument.
*/

export function sayPlural(sourceSingular, sourcePlural, count, ...args) {
	try {
		return i18n.sprintf(
			i18n.ngettext(sourceSingular, sourcePlural, count),
			count,
			...args
		);
	} catch (e) {
		/*
		If all else fails, return English, even with ugly placeholders
		so the user can see *something*.
		*/

		return sourcePlural.replace(/%d/g, count);
	}
}
