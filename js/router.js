/**
 Handles URL-based routes. These right now are:
 
 * `#stories`: Show a list of all stories.
 * `#stories/[id]`: Edit a particular story.
 * `#stories/[id]/play`: Plays a particular story.
 * `#stories/[id]/proof`: Produces a proofing copy of a particular story.
 
 If a route isn't recognized, this defaults to a list of all stories.

 @class TwineRouter
 @extends Backbone.Router
**/

'use strict';

var TwineRouter = Backbone.Router.extend(
{
	routes:
	{
		'welcome': function()
		{
			window.app.mainRegion.show(new WelcomeView());
		},

		'stories': function()
		{
			// list of all stories

			window.app.mainRegion.show(new StoryListView({ collection: StoryCollection.all() }));
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			window.app.mainRegion.show(new StoryEditView({ model: Story.withId(id) }));
		},

		'stories/:id/play': function (id)
		{
			// play a story
			// FIXME: error handling

			var story = Story.withId(id);
			var formatName = story.get('storyFormat') || AppPref.withName('defaultFormat').get('value');
			var format = StoryFormat.withName(formatName);

			format.publish(story, null, null, _.bind(function (err, output)
			{
				this.replaceContent(output);
			}, this));
		},

		'stories/:id/test': function (id)
		{
			// test a story
			// FIXME: error handling

			var story = Story.withId(id);
			var formatName = story.get('storyFormat') || AppPref.withName('defaultFormat').get('value');
			var format = StoryFormat.withName(formatName);

			format.publish(story, ['debug'], null, _.bind(function (err, output)
			{
				this.replaceContent(output);
			}, this));
		},

		'stories/:storyId/test/:passageId': function (storyId, passageId)
		{
			// test a story
			// FIXME: error handling

			var story = Story.withId(storyId);
			var formatName = story.get('storyFormat') || AppPref.withName('defaultFormat').get('value');
			var format = StoryFormat.withName(formatName);

			format.publish(story, ['debug'], storyId, _.bind(function (err, output)
			{
				this.replaceContent(output);
			}, this));
		},

		'stories/:id/proof': function (id)
		{
			// proof a story
			// FIXME: error handling

			var format = StoryFormat.withName(AppPref.withName('proofingFormat').get('value'));

			format.publish(Story.withId(id), null, null, _.bind(function (err, output)
			{
				this.replaceContent(output);
			}, this));
		},

		'*path': function()
		{
			// default route -- show welcome if the user hasn't already seen it

			var welcomePref = AppPref.withName('welcomeSeen');

			if (welcomePref && welcomePref.get('value') === true)
				window.location.hash = '#stories';
			else
				window.location.hash = '#welcome';
		}
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

	}
});
