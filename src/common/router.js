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
var data = require('../data');
var replaceContent = require('../ui/replace');
var LocaleView = require('../locale/view');
var StoryEditView = require('../story-edit/view');
var StoryListView = require('../story-list/view');
var WelcomeView = require('../welcome/view');

module.exports = Backbone.Router.extend(
{
	initialize: function (options)
	{
		/**
		 The app managed by this router.

		 @property app
		**/

		this.app = options.app;
	},

	welcome: function()
	{
		this.app.mainRegion.show(new WelcomeView());
	},

	locale: function()
	{
		this.app.mainRegion.show(new LocaleView());
	},

	listStories: function()
	{
		// list of all stories

		this.app.mainRegion.show(new StoryListView({ collection: data.stories }));
	},

	editStory: function (id)
	{
		// edit a specific story

		this.app.mainRegion.show(new StoryEditView({ model: data.story(id) }));
	},

	playStory: function (storyId)
	{
		// play a story

		var story = data.story(storyId);

		data.storyFormatForStory(story).publish(story, {}, function (err, result)
		{
			replaceContent(result);
		});
	},

	testStory: function (storyId, passageId)
	{
		// test a story from a particular passage

		var story = data.story(storyId);

		data.storyFormatForStory(story).publish(story, { formatOptions: ['debug'], startId: passageId }, function (err, result)
		{
			replaceContent(result);
		});
	},

	proofStory: function (storyId)
	{
		// proof a story

		var story = data.story(storyId);

		data.storyFormatForProofing().publish(story, {}, function (err, result)
		{
			replaceContent(result);
		});
	},

	startup: function()
	{
		// default route -- show welcome if the user hasn't already seen it

		var welcomePref = data.pref('welcomeSeen', false);

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
