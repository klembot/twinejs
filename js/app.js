/**
 The main Backbone app running the show. This is accessible via the
 global variable `window.app`.
 
 @module Twine
 @class TwineApp
 @extends Backbone.Marionette.Application
**/

TwineApp = Backbone.Marionette.Application.extend(
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

	version: '2.0p2',

	/**
	 Publishes a story to a file to be downloaded by binding it with the
	 runtime template. 

	 @method publishStory
	 @param {Story} story Story model to publish.
	**/

	publishStory: function (story)
	{
		var source = RuntimeTemplate.publish(story);
		var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
		saveAs(blob, story.get('name') + '.html');
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		var output = '';

		_.each(new StoryCollection().fetch(), function (story)
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
			var startPassageId = $story.attr('startnode')
				
				// 2.0p2 legacy
				
				|| $story.attr('data-startnode');

			// create a story object

			var story = new Story();
			story.save(
			{
					name: $story.attr('name')
					
						// 2.0p2 legacy
						
						|| $story.attr('data-name')
			}, { wait: true });

			// and child passages
			
			$story.find(TwineApp.selectors.passageData).each(function()
			{
				var $passage = $(this);
				var id = $passage.attr('pid')
					// 2.0p2 legacy
					|| $passage.attr('data-id'); 
				var pos = $passage.attr('twine-position')
					// 2.0p2 legacy
					|| $passage.attr('data-twine-position');
				var posBits = pos.split(',');

				// decode HTML entities in source
				// if it's a 2.0p2 legacy file
				
				if ($story[0].tagName === 'div')
				{
					var e = document.createElement('div');
					e.innerHTML = $passage.html();
					var text = (e.childNodes.length === 0) ? '' : e.childNodes[0].nodeValue;
				}
				else
				{
					text = $passage.text();
				}

				var passage = new Passage();
				passage.save(
				{
					name: $passage.attr('name')
						// 2.0p2 legacy
						|| $passage.attr('data-name'),
					text: text,
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
	}
},{
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

window.app.addInitializer(function (options)
{
	/**
	 The app router.

	 @property router
	 @type TwineRouter
	**/

	app.router = new TwineRouter();
	Backbone.history.start();
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
