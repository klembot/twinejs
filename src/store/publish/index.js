/*
Publishes a story with a given format. This sits above the story and
story-format modules because it works with both. If you are not working in a
Vuex context, you probably will want to use the helpers.js module in this
directory instead.
*/

import {publishStoryWithFormat} from './helpers';

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

		if (!format) {
			throw new Error(
				`Could not find a story format matching ${story.storyFormat} v${story.storyFormatVersion}.`
			);
		}
	}

	return new Promise((resolve, reject) => {
		store.dispatch('storyFormat/loadFormat', {
			onComplete() {
				resolve(
					publishStoryWithFormat(
						store.state.appInfo,
						story,
						format,
						test ? 'debug' : undefined,
						startPassage
					)
				);
			},
			onError() {
				reject(
					new Error(
						`Could not load story format ${story.storyFormat} v${story.storyFormatVersion}.`
					)
				);
			},
			storyFormatId: format.id
		});
	});
}
