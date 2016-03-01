/**
 Publishes a story by binding it to a story format, either resulting in a
 downloadable file or displaying it in the browser window.

 @method publishStory
 @param {Story} story Story model to publish.
 @param {String} filename filename to save to; if null, displays the result in
	the browser
 @param {Object} options options for publishing: format overrides the story's
	format with a StoryFormat object; formatOptions passes additional options
	to the format; startPassageId overrides the story's start passage
**/

'use strict';
var locale = require('../locale');
var notify = require('../ui/notify');
var replaceContent = require('../ui/replace');
var saveFile = require('../file/save');
var AppPref = require('../data/models/app-pref');
var StoryFormat = require('../data/models/story-format');
var StoryCollection = require('../data/collections/story');

module.exports = {
	publishStory(story, filename, options) {
		options = options || {};
		var format;

		if (options.format) {
			format = options.format;
		}
		else {
			var formatName = options.format || story.get('storyFormat') ||
				AppPref.withName('defaultFormat').get('value');

			format = StoryFormat.withName(formatName);
		}

		format.publish(
			story,
			options.formatOptions,
			options.startPassageId,
			function(err, output) {
				if (err) {
					// L10n: %s is the error message.
					notify(
						locale.say(
							'An error occurred while publishing your story. ' +
							'(%s)',
							err.message
						),
						'danger'
					);
				}
				else {
					if (filename) {
						saveFile(output, filename);
					}
					else {
						replaceContent(output);
					}
				}
			}.bind(this)
		);
	},

	/**
	 Saves an archive of all stories to a file to be downloaded.

	 @method saveArchive
	**/

	saveArchive() {
		var output = '';

		StoryCollection.all().each(function(story) {
			// force publishing even if there is no start point set

			output += story.publish(null, null, true) + '\n\n';
		});

		saveFile(
			output,
			new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' ' +
				locale.say('Twine Archive.html')
		);
	}
};
