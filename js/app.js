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

	version: '2.0p4',

	/**
	 Publishes a story to a file to be downloaded by binding it to a story format.

	 @method publishStory
	 @param {Story} story Story model to publish.
	 @param {StoryFormat} format Story format to publish using.
	 @param {Array} options options to pass to runtime, optional
	**/

	publishStory: function (story, format, options)
	{
		var storyName = '&ldquo;' + story.get('name') + '&rdquo';

		format.publish(story, options, null, function(err, output)
		{
			if (err)
				window.notify('There was an error publishing ' + storyName + ' (' +
				              err.message + ').', 'danger');
			else
			{
				try
				{
					var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
					saveAs(blob, story.get('name') + '.html');
					window.notify(storyName + ' was published successfully.');
				}
				catch (err)
				{
					window.notify('There was an error publishing ' + storyName + ' (' +
				                  err.message + ').', 'danger');
				};
			};
		});
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		var output = '';

		new StoryCollection().all().each(function (story)
		{
			output += story.publish() + '\n\n';
		});

		var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
		saveAs(blob, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
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
		// parse data into a DOM

		var $parsed = $('<html>');
		var count = 0;

		// remove surrounding <html>, if there is one

		if (data.indexOf('<html>') != -1)
			$parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
		else
			$parsed.html(data);

		$parsed.find(TwineApp.selectors.story).each(function()
		{
			var $story = $(this);
			var startPassageId = $story.attr('startnode');

			// create a story object

			var story = new Story();
			story.save(
			{
				name: $story.attr('name')
			}, { wait: true });

			// and child passages
			
			$story.find(TwineApp.selectors.passageData).each(function()
			{
				var $passage = $(this);
				var id = $passage.attr('pid'); 
				var pos = $passage.attr('twine-position');
				var posBits = pos.split(',');

				var passage = new Passage();
				passage.save(
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

			$story.find(TwineApp.selectors.stylesheet).each(function()
			{
				stylesheet += $(this).text() + '\n';
			});

			// likewise for script nodes

			var script = '';

			$story.find(TwineApp.selectors.script).each(function()
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
