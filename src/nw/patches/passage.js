// Patches the Passage model so that as changes are made, the parent story is
// saved.

module.exports = (Passage) => {
	const _ = require('underscore');
	const storyFile = require('../story-file');
	const oldPassageInit = Passage.prototype.initialize;

	Passage.prototype.initialize = function() {
		oldPassageInit.call(this);

		this.on('change destroy', _.debounce(function() {
			// If we have no parent, skip it.
			// (this happens during an import, for example)

			const parent = this.fetchStory();

			if (parent) {
				storyFile.save(parent);
			}
		}, 100), this);
	};
};
