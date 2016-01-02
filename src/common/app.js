/*
//app

This exports the main Backbone app running the show, which extends
[Marionette.Application](1).

[1]: http://marionettejs.com/docs/v2.4.4/marionette.application.html
*/

'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

module.exports = Marionette.Application.extend({
	initialize: function() {
		this.on('start', this.start);
	},

	start: function() {
		var customRenderer = require('../backbone-ext/custom-renderer');
		var nwui = require('../nwui');
		var data = require('../data');
		var ui = require('../ui');
		var TwineRegion = require('../backbone-ext/custom-region');
		var TwineRouter = require('./router');

		if (nwui.active) {
			nwui.initialize();
		}

		/*
		Our main (and only) region.
		@property mainRegion
		@type `backbone-ext/custom-region`
		*/

		this.addRegions({
			mainRegion: {
				selector: '#regions .main',
				regionClass: TwineRegion
			}
		});

		/*
		Initialize the custom renderer and our custom UI (e.g. modals,
		tooltips, etc.).
		*/

		customRenderer.initialize();
		ui.initialize();

		/*
		Our router.
		@property router
		@type `common/router`
		@type {*|exports|module.exports}
		*/
		this.router = new TwineRouter({ app: this });

		Backbone.history.start();

		// Create built-in story formats if they don't already exist.

		if (! data.storyFormat('Harlowe')) {
			data.storyFormats.create({
				name: 'Harlowe',
				url: 'storyFormats/Harlowe/format.js',
				userAdded: false
			});
		};

		if (! data.storyFormat('Snowman')) {
			data.storyFormats.create({
				name: 'Snowman',
				url: 'storyFormats/Snowman/format.js',
				userAdded: false
			});
		};

		if (! data.storyFormat('Paperthin')) {
			data.storyFormats.create({
				name: 'Paperthin',
				url: 'storyFormats/Paperthin/format.js',
				userAdded: false
			});
		};

		if (! data.storyFormat('SugarCube')) {
			data.storyFormats.create({
				name: 'SugarCube',
				url: 'storyFormats/SugarCube/format.js',
				userAdded: false
			});
		};

		// Set the default story formats, if they're not already done.

		data.pref('defaultFormat', 'Harlowe');
		data.pref('proofingFormat', 'Paperthin');
	}
},
{
	/*
	Checks for a newer version of the app. If retrieving this information
	fails, then this does nothing.

	@method checkForUpdate
	@requests http://twinery.org/latestversion/2.json
	@param {Number} latestBuildNumber Build number to consider as current
	@param {Function} callback If a new version is available, this is called
		with an object with the properties buildNumber,
		the newest release's build number, version,
		the human-readable version number, and url,
		the URL the download is available at.
	*/
	checkForUpdate: function(latestBuildNumber, callback) {
		$.getJSON('http://twinery.org/latestversion/2.json', function(data) {
			if (data.buildNumber > latestBuildNumber) {
				callback(data);
			};
		});
	},

	/*
	Returns the human-readable name of the application, as set during the build
	process from `package.json`.
	@method appName
	@returns {String}
	*/
	appName: function() {
		return $('html').data('app-name');
	},

	/*
	Returns version information about the application, as set during the build
	process from `package.json`.
	@method version
	@static
	@returns {Object} Has two properties; `version`, a human readable version
		(i.e. "2.0.10"), and `buildNumber`, which can be used to
		compare versions. A higher build number always denotes a
		later version.
	*/
	version: function() {
		var $html = $('html');

		return {
			version: $html.data('version'),
			buildNumber: parseInt($html.data('build-number'))
		};
	}
});
