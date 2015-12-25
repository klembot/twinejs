/*
# data

This exports properties and methods to provides high-level access to data
stored in the application, and also manages business logic between the
different types of data. In almost all cases, data access should occur through
these methods. In some cases, it makes sense to talk directly to the various
collections this manages, so that as new stories or passages are added, a view
can automatically update without syncing to this. It's OK to talk directly to a
data class under this module to find out specific properties or constants --
for example, the width and height of a passage onscreen.

The one instance where it's *definitely* a bad idea to talk directly to
submodules instead of this is when creating models. Doing so outside of these
methods can lead to an inconsistent state in the application.
*/


'use strict';
var _ = require('underscore');
var Passages = require('./passages');
var Prefs = require('./prefs');
var Stories = require('./stories');
var StoryFormats = require('./story-formats');

var data =
{
	/*
	Sets up the collections and business logic of our data layer.
	@method initialize
	@static
	*/

	initialize: function()
	{
		/*
		All passages.
		@property passages
		@type `data/passages`
		@static
		*/

		this.passages = new Passages();
		this.passages.fetch();

		/*
		All preferences.
		@property passages
		@type `data/prefs`
		@static
		*/

		this.prefs = new Prefs();
		this.prefs.fetch();

		/*
		All stories.
		@property stories
		@type `data/stories`
		@static
		*/

		this.stories = new Stories();
		this.stories.fetch();

		/*
		All story formats.
		@property storyFormats
		@type `data/storyFormats`
		@static
		*/

		this.storyFormats = new StoryFormats();
		this.storyFormats.fetch();

		// Set up passage business logic.

		this.passages.on('sync', function (passage, response, options)
		{
			/*
			If any stories are using this passage's cid
			as their start passage, update it with a real id.
			*/

			if (! options.noParentUpdate)
				_.invoke(data.stories.where({ startPassage: this.cid }), 'save', { startPassage: this.id });
		});

		this.passages.on('change', function (passage, options)
		{
			/*
			Unless the updater specifically requests it by passing a
			`noParentUpdate` option, update the parent story's last update
			property anytime one of its passages changes.
			*/

			if (! options.noParentUpdate)
			{
				var parent = data.storyForPassage(passage);

				if (parent !== undefined)
					parent.save('lastUpdate', new Date());
			};
		});

		// Set up story business logic.

		this.stories.on('destroy', function (story)
		{
			// Whenever a story is deleted, so too are its passages.

			var passages = data.passagesForStory(story);

			while (passages.length > 0)
				passages.at(0).destroy();
		});

		this.stories.on('sync', function (story, response, options)
		{
			/*
			Unless the updater specifically requests it by passing a
			`noChildUpdate` option, update any child passages' `story` property
			when a story gains a real id.
			*/

			if (! options.noChildUpdate)
				_.invoke(data.passages.where({ story: this.cid }), 'save', { story: story.id });
		});

		/*
		Anytime a story changes, update its last updated date. The story
		*shouldn't* save here, since it may not be appropriate yet -- it may be
		in the middle of other changes.
		*/

		this.stories.on('change', function (story)
		{
			// If we're manually setting our last update, don't override that.

			if (story.changedAttributes().lastUpdate === undefined)
				story.set('lastUpdate', new Date());
		});
	},

	/*
	Retreives a passage by its id.

	@method passage
	@param {Number} id database ID
	@return {`data/passage`}
	@static
	*/

	passage: function (id)
	{
		return this.passages.find({ id: id });
	},

	/*
	Retreives all passages belonging to a story as a collection.

	@method passagesForStory
	@param {`data/story`} story story to retrieve passages for
	@return {`data/passages`}
	@static
	*/

	passagesForStory: function (story)
	{
		return new Passages(this.passages.filter({ story: story.get('id') }));
	},

	/*
	Retreives a preference by its name.

	@method pref
	@param {String} name name of the preference
	@param {Any} [defaultValue] if no preference is set, one will be created with this value
	@return {`data/pref`}
	@static
	*/

	pref: function (name, defaultValue)
	{
		var result = this.prefs.find({ name: name });

		if (! result)
			result = this.prefs.create({ name: name, value: defaultValue });

		return result;
	},

	/*
	Retrieves a story by its ID.

	@method story
	@param {Number} id database ID
	@return {`data/story`}
	@static
	*/

	story: function (id)
	{
		return this.stories.find({ id: id });
	},

	/*
	Retrieves a passage's parent story.

	@method storyForPassage
	@param {`data/passage`} passage passage to retrieve story for
	@return {'data/story'}
	@static
	*/

	storyForPassage: function (passage)
	{
		return this.stories.find({ id: passage.get('story') });
	},

	/*
	Retrieves a story format by name.

	@method storyFormat
	@param {String} name name of the story format
	@return {`data/story-format`}
	@static
	*/

	storyFormat: function (name)
	{
		return this.storyFormats.find({ name: name });
	},

	/*
	Retrieves the story format the user has chosen for proofing any story.

	@method storyFormatForProofing
	@return {'data/story-format`}
	@static
	*/

	storyFormatForProofing: function()
	{
		return this.storyFormats.find({ name: this.pref('proofingFormat').get('value') });
	},

	/*
	Retrieves the story format for playing a story.

	@method storyFormatForStory
	@return {'data/story-format`}
	@static
	*/

	storyFormatForStory: function (story)
	{
		return this.storyFormats.find({ name: story.get('storyFormat') });
	},

	/*
	Duplicates a story and its passages.

	@method duplicateStory
	@param {Story} origStory existing story
	@param {String} name new name of the story
	@return {Story} new Story model
	@static
	*/

	duplicateStory: function (origStory, name)
	{
		var dupeStory = origStory.clone();
		dupeStory.unset('id');
		dupeStory.collection = this.stories;
		dupeStory.save({ name: name }, { wait: true });

		var startPassageId = origStory.get('startPassage');
		var newStart;

		this.passagesForStory(origStory).each(function (origPassage)
		{
			var dupePassage = origPassage.clone();
			dupePassage.unset('id');
			dupePassage.collection = this.passages;

			/*
			We create new passages in two steps to avoid an ugly bug with
			passage validation; the passage needs to verify that our name isn't
			duplicated, but it can only do this by looking up the story with
			its ID, not by consulting the attrs hash passed to it.
			*/

			dupePassage.set('story', dupeStory.id);
			dupePassage.save();

			/*
			Remember this passage's ID for later -- it will be the new start
			passage of the duplicate.
			*/

			if (origPassage.id == startPassageId)
				newStart = dupePassage;
		});

		if (newStart)
			dupeStory.save({ startPassage: newStart.id });

		return dupeStory;
	}
};

module.exports = data;
