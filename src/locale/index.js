/**
 Manages localizing strings, dates, and times.

 @module locale
**/

const jsonp = require('jsonp');
const Jed = require('jed');
const moment = require('moment');

module.exports = {
	/**
	 Loads gettext strings via AJAX. This sets the i18nData and
	 locale properties, and sets up Moment.js for the correct locale.

	 @param {String} locale locale (e.g. en_us) to load
	 @param {Function} callback function to call once done
	**/

	load(locale, callback) {
		/**
		 The app's current locale.

		 @property locale
		 @readonly
		**/

		this.locale = locale;

		/* Set locale in MomentJS. */

		moment.locale(locale);

		/* Set up failover Jed data to get back the source text as-is. */

		const failoverData = {
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
		};

		/*
		If the locale is 'en' or 'en-us', return the failover data early to
		prevent unnecessary requests, especially with the online build.
		*/

		if (locale === 'en' || locale === 'en-us') {
			this.i18nData = failoverData;
			this.i18n = new Jed(this.i18nData);
			callback();
			return;
		}

		/* Attempt to fetch the locale data. */

		jsonp(
			`locale/${locale}.js`,
			{ name: 'locale', timeout: 1000 },
			(err, data) => {
				if (err) {
					this.i18nData = failoverData;
					this.i18n = new Jed(this.i18nData);
					callback();
				}
				else {
					/**
					 The raw JSON data used by Jed.

					@property i18nData
					@type {Object}
					**/

					this.i18nData = data;
					this.i18n = new Jed(this.i18nData);
					callback();
				}
			}
		);
	},

	/**
	 Translates a string to the user-set locale, interpolating variables.
	 Anything passed beyond the source text will be interpolated into it.

	 @param {String} source source text to translate
	 @return string translation
	**/

	say(source, ...args) {
		try {
			if (args.length == 0) {
				return this.i18n.gettext(source);
			}

			/* Interpolation required. */

			return this.i18n.sprintf(this.i18n.gettext(source), ...args);
		}
		catch (e) {
			/*
			If all else fails, return English, even with ugly %d placeholders so
			the user can see *something*.
			*/

			return source;
		}
	},

	/**
	Translates a string to the user-set locale, keeping in mind
	pluralization rules. Any additional arguments passed after the ones
	listed here are interpolated into the resulting string.

	When interpolating, count will always be the first argument.

	@param {String} sourceSingular source text to translate with
	singular form @param {String} sourcePlural source text to translate
	with plural form @param {Number} count count to use for
	pluralization @return string translation
	**/

	sayPlural(sourceSingular, sourcePlural, count, ...args) {
		try {
			return this.i18n.sprintf(
				this.i18n.ngettext(sourceSingular, sourcePlural, count),
				count,
				...args
			);
		}
		catch (e) {
			// if all else fails, return English, even with ugly placeholders
			// so the user can see *something*

			return sourcePlural.replace(/%d/g, count);
		}
	}
};
