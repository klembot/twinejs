/*
Top-level functions for publishing stories. Unlike the publish methods under
data/, these are Vuex-aware, work with IDs instead of direct data, and are
asynchronous.
*/

const {loadFormat} = require('../data/actions/story-format');
const locale = require('../locale');
const {publishStoryWithFormat} = require('../data/publish');

module.exports = {
	getStoryPlayHtml(store, storyId) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return loadFormat(
			store,
			story.storyFormat,
			story.storyFormatVersion
		).then(format =>
			publishStoryWithFormat(store.state.appInfo, story, format)
		);
	},

	getStoryProofingHtml(store, storyId) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return loadFormat(
			store,
			store.state.pref.proofingFormat.name,
			store.state.pref.proofingFormat.version
		).then(format =>
			publishStoryWithFormat(store.state.appInfo, story, format)
		);
	},

	getStoryTestHtml(store, storyId, startPassageId) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return loadFormat(
			store,
			story.storyFormat,
			story.storyFormatVersion
		).then(format =>
			publishStoryWithFormat(
				store.state.appInfo,
				story,
				format,
				['debug'],
				startPassageId
			)
		);
	}
};
