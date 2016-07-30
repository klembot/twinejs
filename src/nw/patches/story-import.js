// Patches the story import process to work with the filesystem. This is a
// brute force approach; when an import completes, the filesystem is forced to
// synchronize with what's in local storage.

module.exports = (StoryImportDialog) => {
	const _ = require('underscore');
	const storyFile = require('../story-file');
	// FIXME
	//const StoryCollection = require('../../data/collections/story');
	const oldImportFile = StoryImportDialog.options.methods.importFile;

	StoryImportDialog.options.methods.importFile = function(e) {
		storyFile.active = false;
		const reader = oldImportFile.call(this, e);

		reader.addEventListener('load', () => {
			// deferred to make sure that the normal event
			// handler fires first

			_.defer(() => {
				storyFile.active = true;
				StoryCollection.all().each(storyFile.save);
			});
		});
	};
};
