/*
Functions that manage publishing archives and stories from the store. Because
they use getters, dispatch actions, *and* resolve to a value, this can't be a
Vuex module.

As little logic as possible should live here--instead it should be in
utils/publish.js.
*/

import {
	publishArchive as utilPublishArchive,
	publishStoryWithFormat
} from '@/util/publish';

export function publishArchive(store) {
	return utilPublishArchive(store.state.story.stories, store.state.appInfo);
}

export async function publishStory(
	store,
	storyId,
	{proof, startPassage, test} = {}
) {
	const story = store.getters['story/storyWithId'](storyId);

	if (!story) {
		throw new Error(`There is no story with ID ${storyId}.`);
	}

	let format;

	if (proof) {
		const {name, version} = store.state.pref.proofingFormat;

		if (!name || !version) {
			throw new Error('The user preference for proofing format is incorrect.');
		}

		format = store.getters['storyFormat/latestFormat'](name, version);
	} else {
		format = store.getters['storyFormat/latestFormat'](
			story.storyFormat,
			story.storyFormatVersion
		);
	}

	if (!format) {
		throw new Error(
			`Could not find a story format matching ${story.storyFormat} version ${story.storyFormatVersion}.`
		);
	}

	await store.dispatch('storyFormat/loadFormat', {storyFormatId: format.id});

	if (!format.properties.source) {
		throw new Error(
			'The story format had no source property even after loading.'
		);
	}

	return publishStoryWithFormat(
		story,
		format.properties.source,
		store.state.appInfo,
		{formatOptions: test ? 'debug' : undefined, startId: startPassage}
	);
}
