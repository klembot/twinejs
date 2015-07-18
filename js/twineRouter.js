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
var Backbone = require('backbone');
var AppPref = require('models/appPref');
var LocaleView = require('views/localeView');
var Story = require('models/story');
var StoryFormat = require('models/storyFormat');
var StoryCollection = require('collections/storyCollection');
var StoryEditView = require('views/storyEditView/storyEditView');
var StoryListView = require('views/storyListView/storyListView');
var WelcomeView = require('views/welcomeView');

var TwineRouter = Backbone.Router.extend(
{
	welcome: function()
	{
		window.app.mainRegion.show(new WelcomeView());
	},

	locale: function()
	{
		window.app.mainRegion.show(new LocaleView());
	},

	listStories: function()
	{
		// list of all stories

		window.app.mainRegion.show(new StoryListView({ collection: StoryCollection.all() }));
	},

	editStory: function (id)
	{
		// edit a specific story

		window.app.mainRegion.show(new StoryEditView({ model: Story.withId(id) }));
	},

	playStory: function (id)
	{
		// play a story

		window.app.publishStory(Story.withId(id));
	},

	testStory: function (storyId, passageId)
	{
		// test a story from a particular passage
		
		window.app.publishStory(Story.withId(storyId), null,
		{
			formatOptions: ['debug'],
			startPassageId: passageId
		});
	},

	proofStory: function (id)
	{
		// proof a story

		var story = Story.withId(id);
		var format = StoryFormat.withName(AppPref.withName('proofingFormat').get('value'));
		
		window.app.publishStory(story, null, { format: format });
	},

	startup: function()
	{
		// default route -- show welcome if the user hasn't already seen it

		var welcomePref = AppPref.withName('welcomeSeen', false);

		if (welcomePref.get('value') === true)
			window.location.hash = '#stories';
		else
			window.location.hash = '#welcome';
	},

	routes:
	{
		'welcome': 'welcome',
		'locale': 'locale',
		'stories': 'listStories',
		'stories/:id': 'editStory',
		'stories/:id/play': 'playStory',
		'stories/:id/test': 'testStory',
		'stories/:storyId/test/:passageId': 'testStory',
		'stories/:id/proof': 'proofStory',
		'*path': 'startup'
	}
});

module.exports = TwineRouter;
