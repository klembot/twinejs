/**
 The main Backbone app running the show. This is accessible via the
 global variable `window.app`.
 
 @module Twine
 @class TwineApp
 @extends Backbone.Marionette.Application
**/

'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var TwineApp = module.exports = Marionette.Application.extend(
{
	initialize: function()
	{
		this.on('start', this.start);
	},

	start: function()
	{
		var customRenderer = require('../backbone-ext/custom-renderer');
		var nwui = require('../nwui');
		var data = require('../data');
		var ui = require('../ui');
		var TwineRegion = require('../backbone-ext/custom-region');
		var TwineRouter = require('./router');

		if (nwui.active)
			nwui.init();

		// set up our main region

		this.addRegions({
			/**
			 The top-level container for views.

			 @property mainRegion
			**/

			mainRegion:
			{
				selector: '#regions .main',
				regionClass: TwineRegion
			}
		});

		customRenderer.init();
		ui.init();

		/**
		 The app router.

		 @property router
		 @type TwineRouter
		**/

		this.router = new TwineRouter({ app: this });
		Backbone.history.start();

		// create built-in story formats if they don't already exist

		if (! data.storyFormat('Harlowe'))
			data.storyFormats.create({ name: 'Harlowe', url: 'storyFormats/Harlowe/format.js', userAdded: false });

		if (! data.storyFormat('Snowman'))
			data.storyFormats.create({ name: 'Snowman', url: 'storyFormats/Snowman/format.js', userAdded: false });

		if (! data.storyFormat('Paperthin'))
			data.storyFormats.create({ name: 'Paperthin', url: 'storyFormats/Paperthin/format.js', userAdded: false });

		if (! data.storyFormat('SugarCube'))
			data.storyFormats.create({ name: 'SugarCube', url: 'storyFormats/SugarCube/format.js', userAdded: false });

		// set default formats if not already set
		// (second param is a default)

		data.pref('defaultFormat', 'Harlowe');
		data.pref('proofingFormat', 'Paperthin');
	},
},
{
	/**
	 Checks for a newer version of the Twine app against
	 http://twinery.org/latestversion/2.json, using build numbers which
	 are automatically generated by Grunt.

	 If retrieving this information fails, then this does nothing.

	 @method checkForUpdate
	 @param {Number} latestBuildNumber build number to consider as current. This is
	                                   required; the app's build number is stored in
									   window.app.buildNumber.
	 @param {Function} callback if a new version is available, this is called with
	                            an object with the properties buildNumber, the newest
								release's build number, version, the human-readable
								version number, and url, the URL the download is available at.
	**/

	checkForUpdate: function (latestBuildNumber, callback)
	{
		$.getJSON('http://twinery.org/latestversion/2.json', function (data)
		{
			if (data.buildNumber > latestBuildNumber)
				callback(data);
		});
	},

	appName: function()
	{
		return $('html').data('app-name');
	},

	version: function()
	{
		return {
			version: $('html').data('version'),
			buildNumber: parseInt($('html').data('build-number'))
		};
	}
});
