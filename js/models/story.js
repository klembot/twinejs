/**
 A story contains many passages, and has a name, stylesheet, script, zoom,
 and last updated date.

 @class Story
 @extends Backbone.Model
**/

'use strict';

var AppPref = require('./appPref');
var PassageCollection = require('../collections/passageCollection');

var Story = Backbone.Model.extend(
{
	defaults: function()
	{
		return {
			name: 'Untitled Story',
			startPassage: -1,
			zoom: 1,
			snapToGrid: false,
			stylesheet: '',
			script: '',
			storyFormat: AppPref.withName('defaultFormat').get('value') || 'Harlowe',
			lastUpdate: new Date()
		};
	},

	template: _.template('<tw-storydata name="<%- storyName %>" ' +
						 'startnode="<%- startNode %>" creator="<%- appName %>" ' +
						 'creator-version="<%- appVersion %>" ' +
						 'format="<%- storyFormat %>" options="<%= options %>" hidden>' +
						 '<style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"><%= stylesheet %></style>' +
						 '<script role="script" id="twine-user-script" type="text/twine-javascript"><%= script %></script>' + 
						 '<%= passageData %></tw-storydata>'),
	
	initialize: function()
	{
		this.on('destroy', function()
		{
			// delete all child passages

			this.fetchPassages().invoke('destroy');
		}, this);

		this.on('sync', function()
		{
			// update any passages using our cid as link

			_.invoke(PassageCollection.all().where({ story: this.cid }), 'save', { story: this.id });
		}, this);

		// any time we change, update our last updated date
		// we *shouldn't* save ourselves here, since it may not
		// be appropriate yet

		this.on('change', function()
		{
			this.set('lastUpdate', new Date());
		}, this);
	},

	/**
	 Fetches a PassageCollection of all passages currently linked to this
	 story. Beware: this collection represents the passages currently in existence
	 at the time of the call, and will not reflect future changes. If there are
	 no passages for this story, this returns an empty collection.

	 @method fetchPassages
	 @return {PassageCollection} collection of matching passages
	**/

	fetchPassages: function()
	{
		var passages = PassageCollection.all();
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
	 @param {StoryFormat} format The story format to use, defaults to 
	 @param {Array} options	A list of options to pass to the format, optional
	 @param {Number} startId passage database ID to start with, overriding the model; optional
	 @return {String} HTML fragment
	**/

	publish: function (options, startId)
	{
		var passageData = '';
		var startDbId = startId || this.get('startPassage');
		var passages = this.fetchPassages();

		// verify that the start passage exists

		if (! startDbId)
			throw new Error("There is no starting point set for this story.");

		if (! passages.findWhere({ id: startDbId }))
			throw new Error("The passage set as starting point for this story does not exist.");

		passages.each(function (p, index)
		{
			passageData += p.publish(index + 1);

			if (p.id == startDbId)
				startId = index + 1;
		});

		return this.template(
		{
			storyName: this.get('name'),
			startNode: startId,
			appName: window.app.name,
			appVersion: window.app.version,
			passageData: passageData,
			stylesheet: this.get('stylesheet'),
			script: this.get('script'),
			options: (options) ? options.join(' ') : null,
			storyFormat: this.get('storyFormat')
		});
	}
});

// early export to avoid circular reference problems

module.exports = Story;
var StoryCollection = require('../collections/storyCollection');

/**
 Locates a story by ID. If none exists, then this returns null.

 @method withId
 @param {Number} id id of the story 
 @static
 @return {Passage} matching story
**/

Story.withId = function (id)
{
	return StoryCollection.all().findWhere({ id: id });
};
