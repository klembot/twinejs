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
const $ = require('jquery');
const Backbone = require('backbone');
const publish = require('../story-publish');
const AppPref = require('../data/models/app-pref');
const LocaleView = require('../locale/view');
const Story = require('../data/models/story');
const StoryCollection = require('../data/collections/story');
const StoryEditView = require('../story-edit-view');
const StoryFormat = require('../data/models/story-format');
const StoryListView = require('../story-list-view');
const WelcomeView = require('../welcome');

module.exports = Backbone.Router.extend({
	initialize(options) {
		/**
		 The app managed by this router.

		 @property app
		**/

		this.app = options.app;
	},

	welcome() {
		this.app.mainRegion.show(new (Backbone.View.extend({
			render() {
				this.innerView = new WelcomeView({
					el: $('<div>').appendTo(this.el)[0]
				});
			},
		}))());	},

	locale() {
		this.app.mainRegion.show(new (Backbone.View.extend({
			render() {
				this.innerView = new LocaleView({
					el: $('<div>').appendTo(this.el)[0]
				});
			},
		}))());
	},

	listStories() {
		// list of all stories
		this.app.mainRegion.show(new (Backbone.View.extend({
			// This "View" is a shim wrapper that allows trans-region to
			// supply special properties to the contained Vue component.
			storyListViewShim: true,
			appearFast: false,
			previouslyEditing(e) {
				this.innerView.zoomFromStory(e);
			},
			render() {
				this.innerView = new StoryListView({
					el: $('<div>').appendTo(this.el)[0],
					data: {
						collection: StoryCollection.all(),
						appearFast: this.appearFast,
					}
				});
			},
		}))());
	},

	editStory(id) {
		// edit a specific story

		this.app.mainRegion.show(
			new StoryEditView({ model: Story.withId(id) })
		);
	},

	playStory(id) {
		// play a story

		publish.publishStory(Story.withId(id));
	},

	testStory(storyId, passageId) {
		// test a story from a particular passage
		
		publish.publishStory(Story.withId(storyId), null, {
			formatOptions: ['debug'],
			startPassageId: passageId
		});
	},

	proofStory(id) {
		// proof a story

		const story = Story.withId(id);
		const format = StoryFormat.withName(
			AppPref.withName('proofingFormat').get('value')
		);
		
		publish.publishStory(story, null, { format });
	},

	startup() {
		// default route -- show welcome if the user hasn't already seen it

		const welcomePref = AppPref.withName('welcomeSeen', false);

		if (welcomePref.get('value') === true) {
			window.location.hash = '#stories';
		}
		else {
			window.location.hash = '#welcome';
		}
	},

	routes: {
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
