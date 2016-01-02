/**
  //archive

  This exports functions that help with creating and importing story archives.
  An archive is just a series of stories published to HTML without a story
  format.
**/

'use strict';
var _ = require('underscore');
var data = require('./index');
var locale = require('../locale');

var archive = {
	/**
	    Imports a file containing either a single published story, or an
	    archive of several stories. The stories are immediately saved to storage.
	    This does not yet work with stories published by Twine 1.x.

	    @method import
	    @param {String} fileData Contents of the file to be imported.
	    @param {Date} lastUpdate [Overrides the last updated date of the stories.]
	    @static
	  **/

	import: function(fileData, lastUpdate) {
		var sels = archive.selectors;

		// Parse the raw data into a DOM.

		var count = 0;
		var nodes = document.createElement('div');

		nodes.innerHTML = fileData;

		// Remove surrounding `<body>`, if there is one.

		_.each(nodes.querySelectorAll(sels.storyData), function(storyEl) {
			var startPassageId = storyEl.attributes.startnode.value;

			// Glom all style nodes into the stylesheet property.

			var stylesheet = '';

			_.each(storyEl.querySelectorAll(sels.stylesheet), function(el) {
				stylesheet += el.textContent + '\n';
			});

			// Likewise for script nodes.

			var script = '';

			_.each(storyEl.querySelectorAll(sels.script), function(el) {
				script += el.textContent + '\n';
			});

			// Create the parent story model...
			var storyAttributes = {
				name: storyEl.attributes.name.value,
				storyFormat: storyEl.attributes.format.value,
				ifid: (storyEl.attributes.ifid) ?
				storyEl.attributes.ifid.value :
				undefined,
				stylesheet: (stylesheet !== '') ?
				stylesheet :
				undefined,
				script: (script !== '') ?
				script :
				undefined
			};
			var story = data.stories.create(
			storyAttributes,
          {
	wait: true,
	silent: true,
	validate: false
          }
      );

			// ... and its child passages.

			_.each(storyEl.querySelectorAll(sels.passageData), function(passageEl) {
				var id = passageEl.attributes.pid.value;
				var pos = passageEl.attributes.position.value;
				var posBits = pos.split(',');
				var tags = passageEl.attributes.tags.value;

				tags = (tags === '') ? [] : tags.split(/\s+/);

				var passage = data.passages.create({
					name: passageEl.attributes.name.value,
					tags: tags,
					text: passageEl.textContent,
					story: story.id,
					left: parseInt(posBits[0]),
					top: parseInt(posBits[1])
				}, { wait: true, silent: true, validate: false });

				if (id == startPassageId) {
					story.save(
					{ startPassage: passage.id },
					{ silent: true, validate: false }
					);
				}
			});

			// Override the update date if requested.

			if (lastUpdate) {
				story.save({
					lastUpdate: lastUpdate
				}, {
					silent: true,
					validate: false
				});
			}

			count++;
		});

		return count;
	},

	/**
	    Saves an archive of all stories to a file to be downloaded.
	    @method create
	    @return {String} HTML output
	    @static
	  **/

	create: function() {
		var output = '';

		data.stories.each(function(story) {
			// Force the story to publish, even if there is no start point set.

			output += story.publish({ startOptional: true }) + '\n\n';
		});

		return output;
	},

	/**
	    Returns a suitable filename for an archive file. This tries its best to
	    offer unique names based on the current date and time.
	    @method name
	    @return {String} filename
	    @static
	  **/

	name: function() {
		return new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' ' +
		locale.say('Twine Archive.html');
	},

	/**
	    A namespace of DOM selectors for published HTML elements.
	    This is aligned with `utils/selectors.js` in Harlowe.
	    @property selectors
	    @type Object
	    @static
	  **/

	selectors: {
		passage: 'tw-passage',
		story: 'tw-story',
		script: '[role=script]',
		stylesheet: '[role=stylesheet]',
		storyData: 'tw-storydata',
		passageData: 'tw-passagedata'
	}
};

module.exports = archive;
