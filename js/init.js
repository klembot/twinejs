// Bootstraps TwineApp after loading localization data, if any.

'use strict';
var AppPref = require('models/appPref');
var TwineApp = require('twineApp');

(function()
{
	var locale;

	window.app = new TwineApp();

	// URL parameter locale overrides everything

	var localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch)
		locale = localeUrlMatch[1];
	else
	{
		// use app preference; default to best guess
		// http://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser

		var localePref = AppPref.withName('locale',
		                                  window.navigator.userLanguage || window.navigator.language ||
		                                  window.navigator.browserLanguage || window.navigator.systemLanguage ||
		                                  'en-us');

		locale = localePref.get('value');
	};

	if (typeof locale == 'string')
        window.app.loadLocale(locale.toLowerCase(), function()
    	{
    		window.app.start();
    	});
    else
    {
        window.app.loadLocale('en', function()
    	{
    		window.app.start();
            _.defer(function()
            {
                // not localized because if we've reached this step,
                // localization isn't working
                ui.notify('Your locale preference has been reset to English due to a technical problem.<br>' +
                          'Please change it with the <b>Language</b> option in the story list.', 'danger');
            });
    	});
    };
})();
