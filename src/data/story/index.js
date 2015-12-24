/*
# story

This exports a class extending `Backbone.Model` which manages stories. A story
contains many passages, and has a name, stylesheet, script, zoom, and last
updated date.
*/

'use strict';
var _ = require('underscore');
var uuid = require('tiny-uuid');
var Backbone = require('backbone');
var locale = require('../../locale');
var TwineApp = require('../../common/app');
var storyDataTemplate = require('./data.ejs');

module.exports = Backbone.Model.extend(
{
	defaults: _.memoize(function()
	{
		/*
		We require the data module here to avoid problems with cyclic
		redundancy.
		*/

		var data = require('../index');

		return {
			name: locale.say('Untitled Story'),
			startPassage: -1,
			zoom: 1,
			snapToGrid: false,
			stylesheet: '',
			script: '',
			storyFormat: data.pref('defaultFormat').get('value') || 'Harlowe',
			lastUpdate: new Date(),
			ifid: uuid().toUpperCase()
		};
	}),

	template: storyDataTemplate,

	/*
	Publishes a story to an HTML fragment, e.g. a collection of DOM elements. It's up to a
	StoryFormat to create a full-fledged HTML document from this.

	@method publish
	@param {Object} options can contain: `formatOptions`, an array of strings to pass to the story format at runtime;
	                         `startId`, passage database ID to start with;
							 `startOptional`, if falsy, then an error is reported when no start passage has been set
	@return {String} HTML fragment
	*/

	publish: function (options)
	{
		var passageData = '';
		var startDbId = options.startId || this.get('startPassage');
		var startId;

		/*
		The data module is included here to avoid problems with cyclic
		dependencies.
		*/

		var data = require('../index');
		var passages = data.passagesForStory(this);

		// Verify that the start passage exists.

		if (! options.startOptional)
		{
			if (! startDbId)
				throw new Error(locale.say('There is no starting point set for this story.'));

			if (! passages.findWhere({ id: startDbId }))
				throw new Error(locale.say("The passage set as starting point for this story does not exist."));
		};

		// Publish each child passage.

		passages.each(function (p, index)
		{
			passageData += p.publish(index + 1);

			if (p.id == startDbId)
				startId = index + 1;
		});

		// Render this as HTML via `data.ejs`.

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
	}
});
