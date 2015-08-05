// bootstrap app after loading localization, if any

var _ = require('underscore');
var locale = require('./locale');
var notify = require('./ui/notify');
var AppPref = require('./data/models/appPref');
var TwineApp = require('./common/app');

(function()
{
	var userLocale;
	window.app = new TwineApp();

	// URL parameter locale overrides everything

	var localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch)
		userLocale = localeUrlMatch[1];
	else
	{
		// use app preference; default to best guess
		// http://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser

		var localePref = AppPref.withName('locale',
		                                  window.navigator.userLanguage || window.navigator.language ||
		                                  window.navigator.browserLanguage || window.navigator.systemLanguage ||
		                                  'en-us');

		userLocale = localePref.get('value');
	};

	if (typeof userLocale == 'string')
        locale.load(userLocale.toLowerCase(), function()
    	{
    		window.app.start();
    	});
    else
    {
        locale.load('en', function()
    	{
    		window.app.start();
            _.defer(function()
            {
                // not localized because if we've reached this step,
                // localization isn't working
                notify('Your locale preference has been reset to English due to a technical problem.<br>' +
                       'Please change it with the <b>Language</b> option in the story list.', 'danger');
            });
    	});
    };
})();
