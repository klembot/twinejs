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
	 Synchronizes all stories and passages in memory with what's been stored.

	 @method sync
	 @param {Function} callback Callback function to invoke once the sync is done.
	**/

	sync: function (callback)
	{
		var self = this;

		this.prefs.fetch({
			success: function()
			{
				self.stories.fetch({
					success: function()
					{
						self.passages.fetch({
							success: function() { if (callback) callback() }
						});
					}
				});
			}
		});
	},

	/**
	 Publishes a story to a file to be downloaded by binding it with the
	 runtime template. 

	 @method publishStory
	 @param {Story} story Story model to publish.
	**/

	publishStory: function (story)
	{
		RuntimeTemplate.publish(story, function (html)
		{
			var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
			saveAs(blob, story.get('name') + '.html');
		});
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		var output = '';
		var stories = this.stories.toArray();
		var i = 0;

		function archiveStory()
		{
			// output, stories, and i are defined above
			
			stories[i].publish(function (html)
			{
				output += html + '\n\n';
				
				if (++i < stories.length)
					archiveStory();
				else
				{
					var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
					saveAs(blob, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
				}
			});
		};

		archiveStory();
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

		var parsed = $('<html>');
		var count = 0;

		// remove surrounding <html>, if there is one

		if (data.indexOf('<html>') != -1)
			parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
		else
			parsed.html(data);

		parsed.find('[data-role="twinestory"]').each(function()
		{
			var $story = $(this);
			var startPassageId = $story.attr('data-startnode');

			// create a story object

			var story = window.app.stories.create({ name: $story.attr('data-name') });

			// and child passages

			$story.find('[data-role="passage"]').each(function()
			{
				var $passage = $(this);
				var posBits = $passage.attr('data-twine-position').split(',');

				passage = window.app.passages.create(
				{
					name: $passage.attr('data-name'),
					text: $passage.html(),
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				});	

				if ($passage.attr('data-id') == startPassageId)
					story.save({ startPassage: passage.id });
			});

			// for now, glom all style nodes into the stylesheet property

			var stylesheet = '';

			$story.find('[data-role="stylesheet"]').each(function()
			{
				stylesheet += $(this).text() + '\n';
			});

			// likewise for script nodes

			var script = '';

			$story.find('[data-role="script"]').each(function()
			{
				script += $(this).text() + '\n';
			});

			if (stylesheet != '' || script != '')
				story.save({ stylesheet: stylesheet, script: script });

			count++;
		});

		return count;
	}
});

window.app = new TwineApp();

window.app.addInitializer(function (options)
{
	/**
	 The master collection of all stories.

	 @property stories
	 @type StoryCollection
	**/

	app.stories = new StoryCollection();

	/**
	 The master collection of all passages. This is not differentiated
	 by story at all -- you'd need to query by a parent story's ID.

	 @property passages
	 @type PassageCollection
	**/

	app.passages = new PassageCollection();

	/**
	 The master collection of all preferences.

	 @property prefs
	 @type AppPrefCollection
	**/

	app.prefs = new AppPrefCollection();
	app.sync();

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
