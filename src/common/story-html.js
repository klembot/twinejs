/*
Top-level functions for publishing stories. Unlike the publish methods under
data/, these are Vuex-aware, work with IDs instead of direct data, and are
asynchronous.
*/

import {loadFormat} from '../data/actions/story-format';

import {say} from '../locale';
import {publishStoryWithFormat} from '../data/publish';

export function getStoryPlayHtml(store, storyId) {
	const story = store.state.story.stories.find(story => story.id === storyId);

	if (!story) {
		throw new Error(say('There is no story with ID %s.', storyId));
	}

	return loadFormat(store, story.storyFormat, story.storyFormatVersion).then(
		format => publishStoryWithFormat(store.state.appInfo, story, format)
	);
}

export function getStoryProofingHtml(store, storyId) {
	const story = store.state.story.stories.find(story => story.id === storyId);

	if (!story) {
		throw new Error(say('There is no story with ID %s.', storyId));
	}

	return loadFormat(
		store,
		store.state.pref.proofingFormat.name,
		store.state.pref.proofingFormat.version
	).then(format => publishStoryWithFormat(store.state.appInfo, story, format));
}

export function getStoryTestHtml(store, storyId, startPassageId) {
	const story = store.state.story.stories.find(story => story.id === storyId);

	if (!story) {
		throw new Error(say('There is no story with ID %s.', storyId));
	}

	return loadFormat(store, story.storyFormat, story.storyFormatVersion).then(
		format =>
			publishStoryWithFormat(
				store.state.appInfo,
				story,
				format,
				['debug'],
				startPassageId
			)
	);
}
