/*
# locale

Exports functions that manage localizing strings, dates, and times.
*/

var $ = require('jquery');
var Jed = require('jed');
var moment = require('moment');

module.exports = {
	/*
	Loads gettext strings via AJAX. This sets the i18nData and
	locale properties, and sets up Moment.js for the correct locale.

	@method load
	@static
	@param {String} locale locale (e.g. en_us) to load
	@param {Function} callback function to call once done
	*/
	load: function(locale, callback) {
		/*
		The app's current locale.

		@property locale
		@static
		*/
		this.locale = locale;

		// Set locale in MomentJS.

		moment.locale(locale);

		function onAlways(data) {
			/*
			The raw JSON data used by Jed.

			@property i18nData
			@static
			@type {Object}
			*/
			this.i18nData = data;
			this.i18n = new Jed(this.i18nData);
			callback();
		}

		if (locale != 'en-us' && locale != 'en') {
			$.ajax({
				url: 'locale/' + locale + '.js',
				dataType: 'jsonp',
				jsonpCallback: 'locale',
				crossDomain: true
			})
				.always(onAlways.bind(this));
		}
		else {
			// Dummy in data to get back source text as-is.

			// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

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

			// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

			this.i18n = new Jed(this.i18nData);
			callback();
		}
	},

	/*
	Translates a string to the user-set locale, interpolating variables.
	Anything passed beyond the source text will be interpolated into it.
	EJS templates receive access to this via the shortcut function `s()`.

	@method say
	@static
	@param {String} source source text to translate
	@return {String} translation
	*/
	say: function(source) {
		try {
			var message;

			if (arguments.length == 1) {
				// This doesn't require any interpolation.

				message = this.i18n.gettext(source);
			}
			else {
				// Interpolation is required.
				// Line up the arguments for invoking Jed properly.

				var sprintfArgs = [this.i18n.gettext(source)];

				for (var i = 1; i < arguments.length; i++) {
					sprintfArgs.push(arguments[i]);
				}

				message = this.i18n.sprintf.apply(this.i18n.sprintf, sprintfArgs);
			}
		}
		catch (e) {
			/*
			If all else fails, return English, even with ugly %d placeholders,
			so the user can see *something*.
			*/

			message = source;
		}

		return message;
	},

	/*
	Translates a string to the user-set locale, keeping in mind pluralization
	rules. Any additional arguments passed after the ones listed here are
	interpolated into the resulting string. EJS template receive this as the
	shorthand method `sp()`.

	When interpolating, count will always be the first argument.

	@method sayPlural
	@static
	@param {String} sourceSingular source text to translate with singular form
	@param {String} sourcePlural source text to translate with plural form
	@param {Number} count count to use for pluralization
	@return {String} translation
	*/

	sayPlural: function(sourceSingular, sourcePlural, count) {
		try {
			var sprintfArgs = [
				this.i18n.ngettext(sourceSingular, sourcePlural, count),
				count
			];

			for (var i = 3; i < arguments.length; i++) {
				sprintfArgs.push(arguments[i]);
			}

			return this.i18n.sprintf.apply(this.i18n.sprintf, sprintfArgs);
		}
		catch (e) {
			/*
			If all else fails, return English, even with ugly placeholders, so
			the user can see *something*.
			*/

			return sourcePlural.replace(/%d/g, count);
		}
	}
};
