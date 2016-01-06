/*
# router

This exports a class extending [Backbone.Router](1) which handles URL-based
routes. These right now are:

- `#locale`: Allows the user to choose a locale for the application.
- `#stories`: Show a list of all stories.
- `#stories/[id]`: Edit a particular story.
- `#stories/[id]/play`: Plays a particular story.
- `#stories/[id]/test`: Plays a particular story in debug mode.
- `#stories/[id]/test/[id]`: Plays a particular story in debug mode, starting
from a given passsage.
- `#stories/[id]/proof`: Produces a proofing copy of a particular story.
- `#welcome`: Shows an onboarding introduction.

If a route isn't recognized, this defaults to the welcome route or story list,
depending on whether the user has visited the welcome route before.
*/

'use strict';
var Backbone = require('backbone');
var data = require('../data');
var replaceContent = require('../ui/replace');
var LocaleView = require('../locale/view');
var StoryEditView = require('../story-edit/view');
var StoryListView = require('../story-list/view');
var WelcomeView = require('../welcome/view');

module.exports = Backbone.Router.extend({
	initialize: function(options) {
		/*
		Our parent app.

		@property app
		@type `common/app`
		*/
		this.app = options.app;
	},

	welcome: function() {
		this.app.mainRegion.show(new WelcomeView());
	},

	locale: function() {
		this.app.mainRegion.show(new LocaleView());
	},

	listStories: function() {
		this.app.mainRegion.show(new StoryListView({ collection: data.stories }));
	},

	editStory: function(id) {
		this.app.mainRegion.show(new StoryEditView({ model: data.story(id) }));
	},

	playStory: function(storyId) {
		var story = data.story(storyId);

		data.storyFormatForStory(story).publish(story, {}, function(err, result) {
			replaceContent(result);
		});
	},

	testStory: function(storyId, passageId) {
		var story = data.story(storyId);
		var storyOptions = {
			formatOptions: ['debug'],
			startId: passageId
		};

		data.storyFormatForStory(story)
			.publish(story, storyOptions, function(err, result) {
				replaceContent(result);
			});
	},

	proofStory: function(storyId) {
		var story = data.story(storyId);

		data.storyFormatForProofing().publish(story, {}, function(err, result) {
			replaceContent(result);
		});
	},

	// The default route.

	startup: function() {
		var welcomePref = data.pref('welcomeSeen', false);

		if (welcomePref.get('value') === true) {
			window.location.hash = '#stories';
		}
		else {
			window.location.hash = '#welcome';
		};
	},

	routes: {
		welcome: 'welcome',
		locale: 'locale',
		stories: 'listStories',
		'stories/:id': 'editStory',
		'stories/:id/play': 'playStory',
		'stories/:id/test': 'testStory',
		'stories/:storyId/test/:passageId': 'testStory',
		'stories/:id/proof': 'proofStory',
		'*path': 'startup'
	}
});
