/**
 Manages localizing strings, dates, and times.

 @module locale
**/

// Jed expects some keys with underscores.
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

const $ = require('jquery');
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

		// set locale in MomentJS

		moment.locale(locale);

		if (locale != 'en-us' && locale != 'en') {
			$.ajax({
				url: 'locale/' + locale + '.js',
				dataType: 'jsonp',
				jsonpCallback: 'locale',
				crossDomain: true
			})
			.always(function load(data) {
				/**
				 The raw JSON data used by Jed.

				 @property i18nData
				 @type {Object}
				**/

				this.i18nData = data;
				this.i18n = new Jed(this.i18nData);
				callback();
			}.bind(this));
		}
		else {
			// dummy in data to get back source text as-is

			this.i18nData = {
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

			this.i18n = new Jed(this.i18nData);
			callback();
		};
	},

	/**
	 Translates a string to the user-set locale, interpolating variables.
	 Anything passed beyond the source text will be interpolated into it.
	 Underscore templates receive access to this via the shorthand method s().

	 @param {String} source source text to translate
	 @return string translation
	**/

	say(source, ...args) {
		try {
			if (args.length == 0) {
				return this.i18n.gettext(source);
			}

			// interpolation required

			return this.i18n.sprintf(this.i18n.gettext(source), ...args);
		}
		catch (e) {
			// if all else fails, return English, even with ugly %d placeholders
			// so the user can see *something*

			return source;
		}
	},

	/**
	 Translates a string to the user-set locale, keeping in mind pluralization
	 rules. Any additional arguments passed after the ones listed here are
	 interpolated into the resulting string. Underscore template receive this
	 as the shorthand method sp.

	 When interpolating, count will always be the first argument.
	
	 @param {String} sourceSingular source text to translate with singular form
	 @param {String} sourcePlural source text to translate with plural form
	 @param {Number} count count to use for pluralization
	 @return string translation
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
