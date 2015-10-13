/**
 Allows the user to pick what locale they would like to use.

 @class LocaleView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var locale = require('./index.js');
var AppPref = require('../data/models/appPref');
var localeTemplate = require('./ejs/localeView.ejs');

module.exports = Marionette.ItemView.extend(
{
	template: localeTemplate,

	/**
	 Sets the application locale and forces a window reload
	 back to the story list.

	 @method setLocale
	 @param {String} userLocale locale to set
	**/

	setLocale: function (userLocale)
	{
		if (typeof userLocale !== 'string')
		{
			// L10n: An internal error when changing locale.
			throw new Error(locale.say("Can't set locale to nonstring: %s", userLocale));
		};

		AppPref.withName('locale').save({ value: userLocale });
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
