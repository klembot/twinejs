// import {latestFormat} from '../modules/story-format/getters';
// import {loadFormat} from '../modules/story-format/actions';
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
