// Patches the Story model so that it saves to the filesystem as changes are
// made.

module.exports = (Story) => {
	const oldStoryInit = Story.prototype.initialize;

	Story.prototype.initialize = function() {
		const _ = require('underscore');
		const storyFile = require('../story-file');

		oldStoryInit.call(this);
		
		this.on('change', _.throttle(function() {
			// If the only thing that is changing is last modified
			// date, then skip it.
			
			if (!_.some(
				_.keys(this.changedAttributes()),
				key => key != 'lastUpdated'
			)) {
				return;
			}
			
			// If the story has no passages, skip it also.

			if (this.fetchPassages().length === 0) {
				return;
			}

			try {
				storyFile.save(this);
			}
			catch (e) {
				// FIXME
			}
		}, 100), this);

		this.on('destroy', function() {
			try {
				storyFile.delete(this);
			}
			catch (e) {
				// FIXME
			}
		}, this);
	};
};
