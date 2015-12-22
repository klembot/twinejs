'use strict';
var _ = require('underscore');
var Passages = require('./passages');
var Prefs = require('./prefs');
var Stories = require('./stories');
var StoryFormats = require('./story-formats');

var data = module.exports =
{
	initialize: function()
	{
		this.passages = new Passages();
		this.passages.fetch();
		this.prefs = new Prefs();
		this.prefs.fetch();
		this.stories = new Stories();
		this.stories.fetch();
		this.storyFormats = new StoryFormats();
		this.storyFormats.fetch();

		// passage business logic

		this.passages.on('sync', function (passage, response, options)
		{
			// if any stories are using this passage's cid
			// as their start passage, update with a real id

			if (! options.noParentUpdate)
				_.invoke(data.stories.where({ startPassage: this.cid }), 'save', { startPassage: this.id });
		});

		this.passages.on('change', function (passage, options)
		{
			// update parent story's last update date

			if (! options.noParentUpdate)
			{
				var parent = data.storyForPassage(passage);
				
				if (parent !== undefined)
					parent.save('lastUpdate', new Date());
			};
		});

		// story business logic

		this.stories.on('destroy', function (story)
		{
			// delete all child passages

			var passages = data.passagesForStory(story);

			while (passages.length > 0)
				passages.at(0).destroy();
		});

		this.stories.on('sync', function (story, response, options)
		{
			// update any passages using our cid as link

			if (! options.noChildUpdate)
				_.invoke(data.passages.where({ story: this.cid }), 'save', { story: story.id });
		});

		// any time a story changes, update our last updated date
		// The story *shouldn't* save here, since it may not
		// be appropriate yet.

		this.stories.on('change', function (story)
		{
			// if we're manually setting our last update, don't override that

			if (story.changedAttributes().lastUpdate === undefined)
				story.set('lastUpdate', new Date());
		});
	},

	passage: function (id)
	{
		return this.passages.find({ id: id });
	},

	passagesForStory: function (story)
	{
		return new Passages(this.passages.filter({ story: story.get('id') }));
	},

	pref: function (name, defaultValue)
	{
		var result = this.prefs.find({ name: name });

		if (! result)
			result = this.prefs.create({ name: name, value: defaultValue });
		
		return result;
	},

	story: function (id)
	{
		return this.stories.find({ id: id });
	},

	storyForPassage: function (passage)
	{
		return this.stories.find({ id: passage.get('story') });
	},

	storyFormat: function (name)
	{
		return this.storyFormats.find({ name: name });
	},

	storyFormatForProofing: function()
	{
		return this.storyFormats.find({ name: this.pref('proofingFormat').get('value') });
	},

	storyFormatForStory: function (story)
	{
		return this.storyFormats.find({ name: story.get('storyFormat') });
	},

	/**
	 Duplicates a story and its passages.

	 @param {Story} origStory existing story
	 @param {String} name new name of the story
	 @return {Story} new Story model
	**/

	duplicateStory: function (origStory, name)
	{
		var dupeStory = orig.clone();
		dupeStory.unset('id');
		dupeStory.collection = this.stories;
		dupeStory.save({ name: name }, { wait: true });

		var startPassageId = story.get('startPassage');
		var newStart;

		this.passagesForStory(origStory).each(function (origPassage)
		{
			var dupePassage = origPassage.clone();
			dupePassage.unset('id');
			dupePassage.collection = this.passages;

			// we do this in two steps to avoid an ugly bug
			// with passage validation; it needs to verify
			// that our name isn't duplicated, but it can
			// only do this by looking up the story with its ID,
			// not by consulting the attrs hash passed to it

			dupePassage.set('story', dupeStory.id);
			dupePassage.save();

			if (origPassage.id == startPassageId)
				newStart = dupePassage;
		});

		if (newStart)
			dupeStory.save({ startPassage: newStart.id });

		return dupeStory;
	}
};
