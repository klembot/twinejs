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
			// edit a specific story

			window.app.mainRegion.show(new StoryEditView({ model: Story.withId(id) }));
		},

		'stories/:id/play': function (id)
		{
			// play a story

			window.app.publishStory(Story.withId(id));
		},

		'stories/:id/test': function (id)
		{
			// test a story from the beginning

			window.app.publishStory(Story.withId(id), null, { formatOptions: ['debug'] });
		},

		'stories/:storyId/test/:passageId': function (storyId, passageId)
		{
			// test a story from a particular passage
			
			window.app.publishStory(Story.withId(storyId), null,
			{
				formatOptions: ['debug'],
				startPassageId: passageId
			});
		},

		'stories/:id/proof': function (id)
		{
			// proof a story

			var story = Story.withId(id);
			var format = StoryFormat.withName(AppPref.withName('proofingFormat').get('value'));
			
			window.app.publishStory(story, null, { format: format });
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
	}
});
