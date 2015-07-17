/**
 Allows the user to pick what locale they would like to use.

 @class LocaleView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var Marionette = require('backbone.marionette');
var AppPref = require('models/appPref');
var localeTemplate = require('templates/localeView.html');

var LocaleView = Marionette.ItemView.extend(
{
	template: localeTemplate,

	/**
	 Sets the application locale and forces a window reload
	 back to the story list.

	 @method setLocale
	 @param {String} locale locale to set
	**/

	setLocale: function (locale)
	{
		if (typeof locale !== 'string')
		{
			// L10n: An internal error when changing locale.
			throw new Error(window.app.say("Can't set locale to nonstring: %s", locale));
		};

		AppPref.withName('locale').save({ value: locale });
		window.location.hash = 'stories';
		window.location.reload();
	},

	events:
	{
		'click [data-locale]': function (e)
		{
			this.setLocale($(e.target).closest('[data-locale]').data('locale'));
		}
	}
});

module.exports = LocaleView;
