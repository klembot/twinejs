'use strict';
var _ = require('underscore');
var data = require('./index');
var locale = require('../locale');

var archive = module.exports =
{
	/**
	 Imports a file containing either a single published story, or an
	 archive of several stories. The stories are immediately saved to storage.
	 This does not yet work with stories published by Twine 1.x.

	 @param {String} fileData Contents of the file to be imported.
	 @param {Date} lastUpdate If passed, overrides the last updated date of the stories.
	**/

	import: function (fileData, lastUpdate)
	{
		var sels = archive.selectors;

		// parse data into a DOM

		var count = 0;
		var nodes = document.createElement('div');
		nodes.innerHTML = fileData;

		// remove surrounding <body>, if there is one

		_.each(nodes.querySelectorAll(sels.storyData), function (storyEl)
		{
			var startPassageId = storyEl.attributes.startnode.value;

			// glom all style nodes into the stylesheet property

			var stylesheet = '';

			_.each(storyEl.querySelectorAll(sels.stylesheet), function (el)
			{
				stylesheet += el.textContent + '\n';
			});

			// likewise for script nodes

			var script = '';

			_.each(storyEl.querySelectorAll(sels.script), function (el)
			{
				script += el.textContent + '\n';
			});

			// create a story object

			var story = data.stories.create(
			{
				name: storyEl.attributes.name.value,
				storyFormat: storyEl.attributes.format.value,
				ifid: (storyEl.attributes.ifid) ? storyEl.attributes.ifid.value : undefined,
				stylesheet: (stylesheet !== '') ? stylesheet : undefined,
				script: (script !== '') ? script : undefined
			}, { wait: true, silent: true, validate: false });

			// and child passages

			_.each(storyEl.querySelectorAll(sels.passageData), function (passageEl)
			{
				var id = passageEl.attributes.pid.value;
				var pos = passageEl.attributes.position.value;
				var posBits = pos.split(',');
				var tags = passageEl.attributes.tags.value;
				tags = (tags === '') ? [] : tags.split(/\s+/);

				var passage = data.passages.create(
				{
					name: passageEl.attributes.name.value,
					tags: tags,
					text: passageEl.textContent,
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				}, { wait: true, silent: true, validate: false });

				if (id == startPassageId)
					story.save({ startPassage: passage.id }, { silent: true, validate: false });
			});
			
			// override update date if requested
			
			if (lastUpdate)
				story.save({ lastUpdate: lastUpdate }, { silent: true, validate: false });

			count++;
		});

		return count;
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method create
	**/

	create: function()
	{
		var output = '';

		data.stories.each(function (story)
		{
			// force publishing even if there is no start point set

			output += story.publish({ startOptional: true }) + '\n\n';
		});

		return output;
	},

	name: function()
	{
		return new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' ' +
		       locale.say('Twine Archive.html');
	},

	/**
	 A static namespace of DOM selectors for published HTML elements.
	 This is aligned with utils/selectors.js in Harlowe.
	
	 @property selectors
	 @type Object
	 @final
	**/

	selectors:
	{
		passage: 'tw-passage',
		story: 'tw-story',
		script: '[role=script]',
		stylesheet: '[role=stylesheet]',
		storyData: 'tw-storydata',
		passageData: 'tw-passagedata'
	}
};