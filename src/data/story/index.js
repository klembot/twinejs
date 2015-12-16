/**
 A story contains many passages, and has a name, stylesheet, script, zoom,
 and last updated date.

 @class Story
 @extends Backbone.Model
**/

'use strict';
var _ = require('underscore');
var uuid = require('tiny-uuid');
var Backbone = require('backbone');
var locale = require('../../locale');
var TwineApp = require('../../common/app');
var storyDataTemplate = require('./data.ejs');

var Story = Backbone.Model.extend(
{
	defaults: _.memoize(function()
	{
		return {
			name: locale.say('Untitled Story'),
			startPassage: -1,
			zoom: 1,
			snapToGrid: false,
			stylesheet: '',
			script: '',
			storyFormat: Pref.withName('defaultFormat').get('value') || 'Harlowe',
			lastUpdate: new Date(),
			ifid: uuid().toUpperCase()
		};
	}),

	template: storyDataTemplate,
	
	initialize: function()
	{
		this.on('destroy', function()
		{
			// delete all child passages

			var passages = this.fetchPassages();

			while (passages.length > 0)
				passages.at(0).destroy();
		}, this);

		this.on('sync', function (model, response, options)
		{
			// update any passages using our cid as link

			if (! options.noChildUpdate)
				_.invoke(Passages.all().where({ story: this.cid }), 'save', { story: this.id });
		}, this);

		// any time we change, update our last updated date
		// we *shouldn't* save ourselves here, since it may not
		// be appropriate yet

		this.on('change', function()
		{
			// if we're manually setting our last update, don't override that

			if (this.changedAttributes().lastUpdate === undefined)
				this.set('lastUpdate', new Date());
		}, this);
	},

	/**
	 Fetches a Passages collection of all passages currently linked to this
	 story. Beware: this collection represents the passages currently in existence
	 at the time of the call, and will not reflect future changes. If there are
	 no passages for this story, this returns an empty collection.

	 @method fetchPassages
	 @return {Passages} collection of matching passages
	**/

	fetchPassages: function()
	{
		var passages = Passages.all();
		passages.reset(passages.filter(function (p)
		{
			return p.get('story') == this.id || p.get('story') == this.cid;
		}, this));
		
		return passages;
	},

	/**
	 Publishes a story to an HTML fragment, e.g. a collection of DOM elements. It's up to a
	 StoryFormat to create a full-fledged HTML document from this.

	 @method publish
	 @param {Object} options Can contain: formatOptions, an array of strings to pass to the story format at runtime;
	                         startId, passage database ID to start with;
							 startOptional If falsy, then an error is reported when no start passage has been set
	 @return {String} HTML fragment
	**/

	publish: function (options)
	{
		var passageData = '';
		var startDbId = options.startId || this.get('startPassage');
		var startId;
		var passages = this.fetchPassages();

		// verify that the start passage exists

		if (! options.startOptional)
		{
			if (! startDbId)
				throw new Error(locale.say('There is no starting point set for this story.'));

			if (! passages.findWhere({ id: startDbId }))
				throw new Error(locale.say("The passage set as starting point for this story does not exist."));
		};

		passages.each(function (p, index)
		{
			passageData += p.publish(index + 1);

			if (p.id == startDbId)
				startId = index + 1;
		});

		return this.template(
		{
			storyName: this.get('name'),
			startNode: startId || '',
			appName: TwineApp.appName(),
			appVersion: TwineApp.version().version,
			passageData: passageData,
			stylesheet: this.get('stylesheet'),
			script: this.get('script'),
			options: (options.formatOptions) ? options.formatOptions.join(' ') : '',
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

	duplicate: function (name)
	{
		var storyC = new Stories();
		var passageC = new Passages();

		var dupeStory = this.clone();
		dupeStory.unset('id');
		dupeStory.collection = storyC;
		dupeStory.save({ name: name }, { wait: true });

		var startPassageId = this.get('startPassage');
		var newStart;

		this.fetchPassages().each(function (orig)
		{
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

			if (orig.id == startPassageId)
				newStart = dupePassage;
		});

		if (newStart)
			dupeStory.save({ startPassage: newStart.id });

		return dupeStory;
	}
});

// early export to avoid circular reference problems
// silence JSHint flagging that we use StoryCollection in a method above

module.exports = Story;
var Pref = require('../pref');
var Passages = require('../passages');
var Stories = require('../stories');

/**
 Locates a story by ID. If none exists, then this returns null.

 @method withId
 @param {Number} id id of the story 
 @static
 @return {Passage} matching story
**/

Story.withId = function (id)
{
	return Stories.all().findWhere({ id: id });
};
