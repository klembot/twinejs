/**
 A story contains many passages, and has a name, stylesheet, script, zoom, and
 last updated date.

 @class Story
 @extends Backbone.Model
**/

'use strict';
var _ = require('underscore');
var uuid = require('tiny-uuid');
var Backbone = require('backbone');
var locale = require('../../locale');
var AppPref = require('./app-pref');
var PassageCollection = require('../collections/passage');
var storyDataTemplate = require('./ejs/story-data.ejs');

var Story = Backbone.Model.extend({
	defaults: _.memoize(function() {
		return {
			name: locale.say('Untitled Story'),
			startPassage: -1,
			zoom: 1,
			snapToGrid: false,
			stylesheet: '',
			script: '',
			storyFormat: AppPref.withName('defaultFormat').get('value') ||
				'Harlowe',
			lastUpdate: new Date(),
			ifid: uuid().toUpperCase()
		};
	}),

	template: storyDataTemplate,
	
	initialize() {
		this.on('destroy', function() {
			// delete all child passages

			var passages = this.fetchPassages();

			while (passages.length > 0) {
				passages.at(0).destroy();
			}
		}, this);

		this.on('sync', function(model, response, options) {
			// update any passages using our cid as link

			if (!options.noChildUpdate) {
				_.invoke(
					PassageCollection.all().where({ story: this.cid }),
					'save',
					{ story: this.id }
				);
			}
		}, this);

		// any time we change, update our last updated date
		// we *shouldn't* save ourselves here, since it may not
		// be appropriate yet

		this.on('change', function() {
			// if we're manually setting our last update, don't override that

			if (this.changedAttributes().lastUpdate === undefined) {
				this.set('lastUpdate', new Date());
			}
		}, this);
	},

	/**
	 Fetches a PassageCollection of all passages currently linked to this
	 story. Beware: this collection represents the passages currently in
	 existence at the time of the call, and will not reflect future changes. If
	 there are no passages for this story, this returns an empty collection.

	 @method fetchPassages
	 @return {PassageCollection} collection of matching passages
	**/

	fetchPassages() {
		var passages = PassageCollection.all();

		passages.reset(passages.filter(function(p) {
			return p.get('story') == this.id || p.get('story') == this.cid;
		}, this));
		
		return passages;
	},

	/**
	 Publishes a story to an HTML fragment, e.g. a collection of DOM elements.
	 It's up to a StoryFormat to create a full-fledged HTML document from this.

	 @method publish
	 @param {StoryFormat} format The story format to use, defaults to
	 @param {Array} options	A list of options to pass to the format, optional
	 @param {Number} startId passage database ID to start with, overriding the
		model; optional
	 @param {Boolean} startOptional If falsy, then an error is reported when no
		 start passage has been set; optional
	 @return {String} HTML fragment
	**/

	publish(options, startId, startOptional) {
		var passageData = '';
		var startDbId = startId || this.get('startPassage');
		var passages = this.fetchPassages();

		// verify that the start passage exists

		if (!startOptional) {
			if (!startDbId) {
				throw new Error(locale.say(
					'There is no starting point set for this story.'
				));
			}

			if (!passages.findWhere({ id: startDbId })) {
				throw new Error(locale.say(
					'The passage set as starting point for this story does ' +
					'not exist.'
				));
			}
		};

		passages.each(function(p, index) {
			passageData += p.publish(index + 1);

			if (p.id == startDbId) { startId = index + 1; }
		});

		return this.template({
			storyName: this.get('name'),
			startNode: startId || '',
			appName: window.app.name,
			appVersion: window.app.version,
			passageData: passageData,
			stylesheet: this.get('stylesheet'),
			script: this.get('script'),
			options: (options) ? options.join(' ') : '',
			storyFormat: this.get('storyFormat'),
			ifid: this.get('ifid')
		});
	},

	/**
	 Duplicates this model and its passages.

	 @method duplicate
	 @param {String} name new name of the story
	 @return {Story} new Story model
	**/

	duplicate(name) {
		var storyC = new StoryCollection();
		var passageC = new PassageCollection();
		var dupeStory = this.clone();

		dupeStory.unset('id');
		dupeStory.collection = storyC;
		dupeStory.save({ name: name }, { wait: true });

		var startPassageId = this.get('startPassage');
		var newStart;

		this.fetchPassages().each(function(orig) {
			var dupePassage = orig.clone();

			dupePassage.unset('id');
			dupePassage.collection = passageC;

			// we do this in two steps to avoid an ugly bug
			// with passage validation; it needs to verify
			// that our name isn't duplicated, but it can
			// only do this by looking up the story with its ID,
			// not by consulting the attrs hash passed to it

			dupePassage.set('story', dupeStory.id);
			dupePassage.save();

			if (orig.id == startPassageId) {
				newStart = dupePassage;
			}
		});

		if (newStart) {
			dupeStory.save({ startPassage: newStart.id });
		}

		return dupeStory;
	}
});

// early export to avoid circular reference problems
// silence JSHint flagging that we use StoryCollection in a method above

/*jshint -W003 */
module.exports = Story;
var StoryCollection = require('../collections/story');
/*jshint +W003 */

/**
 Locates a story by ID. If none exists, then this returns null.

 @method withId
 @param {Number} id id of the story
 @static
 @return {Passage} matching story
**/

Story.withId = function(id) {
	return StoryCollection.all().findWhere({ id: id });
};
