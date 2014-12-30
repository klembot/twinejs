/**
 The main Backbone app running the show. This is accessible via the
 global variable `window.app`.
 
 @module Twine
 @class TwineApp
 @extends Backbone.Marionette.Application
**/

'use strict';

var TwineApp = Backbone.Marionette.Application.extend(
{
	/**
	 Name of the app.

	 @property name
	**/

	name: 'Twine',

	/**
	 Version number of the app.

	 @property version
	**/

	version: '2.0',

	/**
	 Saves data to a file. This appears to the user as if they had clicked
	 a link to a downloadable file in their browser. If no failure method is specified,
	 then this will show a notification when errors occur.

	 @method saveFile
	 @param {String} data data to save
	 @param {String} filename filename to save to
	 @param {Function} success callback function on a successful save, optional
	 @param {Function} failure callback function on a failed save (passed error), optional
	**/

	saveFile: function (data, filename, success, failure)
	{
		try
		{
			if (! $('body').hasClass('iOS'))
			{
				// standard style

				var blob = new Blob([data], { type: 'text/html;charset=utf-8' });
				saveAs(blob, filename);

				if (success)
					success();
			}
			else
			{
				// package it into a .zip; this will trigger iOS to try to
				// hand it off to Google Drive, Dropbox, and the like

				var zip = new JSZip();
				zip.file(filename, data);
				window.location.href = 'data:application/zip;base64, ' + zip.generate({ type: 'base64' });

				if (success)
					success();
			};
		}
		catch (e)
		{
			if (failure)
				failure(e);
			else
				ui.notify('&ldquo;' + filename + '&rdquo; could not be saved (' +
				          e.message + ').', 'danger');
		};
	},

	/**
	 Completely replaces the document with HTML source.

	 @method replaceContent
	 @param {String} html HTML source to replace, including DOCTYPE, <head>, and <body>.
	**/

	replaceContent: function (html)
	{
		// inject head and body separately -- otherwise DOM errors crop up

		$('head').html(html.substring(html.indexOf('<head>') + 6, html.indexOf('</head>')));
		$('body').html(html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>')));
	},

	/**
	 Publishes a story by binding it to a story format, either resulting in a downloadable
	 file or displaying it in the browser window.

	 @method publishStory
	 @param {Story} story Story model to publish.
	 @param {String} filename filename to save to; if null, displays the result in the browser
	 @param {Object} options options for publishing: format overrides the story's format with a
	                         StoryFormat object; formatOptions passes additional options to the format;
							 startPassageId overrides the story's start passage
	**/

	publishStory: function (story, filename, options)
	{
		options = options || {};
		var format;

		if (options.format)
			format = options.format;
		else
		{
			var formatName = options.format || story.get('storyFormat') ||
							 AppPref.withName('defaultFormat').get('value');

			format = StoryFormat.withName(formatName);
		};

		format.publish(story, options.formatOptions, options.startPassageId,
		               _.bind(function (err, output)
		{
			// TODO: catch errors

			if (filename)
				this.saveFile(output, filename);
			else
				this.replaceContent(output);
		}, this));
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		var output = '';

		StoryCollection.all().each(function (story)
		{
			output += story.publish() + '\n\n';
		});

		this.saveFile(output, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
	},
	
	/**
	 Imports a file containing either a single published story, or an
	 archive of several stories. The stories are immediately saved to storage.
	 This does not yet work with stories published by Twine 1.x.

	 @method importFile
	 @param {String} data Contents of the file to be imported.
	**/

	importFile: function (data)
	{
		var selectors = this.selectors;

		// containers for the new stories and passages we will create
		var allStories = StoryCollection.all();
		var allPassages = PassageCollection.all();

		// parse data into a DOM

		var $parsed = $('<html>');
		var count = 0;

		// remove surrounding <html>, if there is one

		if (data.indexOf('<html>') != -1)
			$parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
		else
			$parsed.html(data);

		$parsed.find(selectors.storyData).each(function()
		{
			var $story = $(this);
			var startPassageId = $story.attr('startnode');

			// create a story object

			var story = allStories.create(
			{
				name: $story.attr('name'),
				storyFormat: $story.attr('format')
			}, { wait: true });

			// and child passages
			
			$story.find(selectors.passageData).each(function()
			{
				var $passage = $(this);
				var id = $passage.attr('pid'); 
				var pos = $passage.attr('position');
				var posBits = pos.split(',');

				var passage = allPassages.create(
				{
					name: $passage.attr('name'),
					text: $passage.text(),
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				}, { wait: true });	

				if (id == startPassageId)
					story.save({ startPassage: passage.id });
			});

			// for now, glom all style nodes into the stylesheet property

			var stylesheet = '';

			$story.find(selectors.stylesheet).each(function()
			{
				stylesheet += $(this).text() + '\n';
			});

			// likewise for script nodes

			var script = '';

			$story.find(selectors.script).each(function()
			{
				script += $(this).text() + '\n';
			});

			if (stylesheet != '' || script != '')
				story.save({ stylesheet: stylesheet, script: script });

			count++;
		});

		return count;
	},

	/**
	 Checks to see if the app is running a browser whose main UI is
	 touch-based. This doesn't necessarily mean that the browser doesn't
	 support touch at all, just that we expect the user to be interacting
	 through touchonly.

	 @method hasPrimaryTouchUI
	 @return {Boolean} whether the browser is primarily touch-based
	**/

	hasPrimaryTouchUI: function()
	{
		return /Android|iPod|iPad|iPhone|IEMobile/.test(window.navigator.userAgent);
	},

	/**
	 A static namespace of DOM selectors for Harlowe HTML elements.
	 This is aligned with utils/selectors.js in Harlowe.
	
	 @property selectors
	 @type Object
	 @final
	*/
	selectors: {
		passage: "tw-passage",
		story: "tw-story",
		script: "[data-role=script]",
		stylesheet: "[data-role=stylesheet]",
		storyData: "tw-storydata, [data-role=twinestory]", // 2.0p2 legacy selector
		passageData: "tw-passagedata, [data-role=passage]" // 2.0p2 legacy selector
	}
});

window.app = new TwineApp();

window.app.addInitializer(function ()
{
	/**
	 The app router.

	 @property router
	 @type TwineRouter
	**/

	app.router = new TwineRouter();
	Backbone.history.start();

	// create built-in story formats if they don't already exist

	var formats = StoryFormatCollection.all();

	if (! formats.findWhere({ name: 'Harlowe' }))
		formats.create({ name: 'Harlowe', url: 'storyformats/Harlowe/format.js', userAdded: false });

	if (! formats.findWhere({ name: 'Snowman' }))
		formats.create({ name: 'Snowman', url: 'storyformats/Snowman/format.js', userAdded: false });

	if (! formats.findWhere({ name: 'Paperthin' }))
		formats.create({ name: 'Paperthin', url: 'storyformats/Paperthin/format.js', userAdded: false });

	// set default formats if not already set

	var prefs = AppPrefCollection.all();

	if (! prefs.findWhere({ name: 'defaultFormat' }))
		prefs.create({ name: 'defaultFormat', value: 'Harlowe' });

	if (! prefs.findWhere({ name: 'proofingFormat' }))
		prefs.create({ name: 'proofingFormat', value: 'Paperthin' });
});

window.app.addRegions(
{
	/**
	 The top-level container for views.

	 @property mainRegion
	**/

	mainRegion: '#regions .main'
});

window.app.start();
