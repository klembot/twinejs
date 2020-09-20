import {passageSizes} from '../passage-sizes';

export function updatePassage(
	{commit, getters},
	{passageId, passageProps, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	if (!story.passages.some(p => p.id === passageId)) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	if (
		passageProps.name &&
		story.passages
			.filter(p => p.name === passageProps.name)
			.some(p => p.id !== passageId)
	) {
		throw new Error(`There is already a passage named "${passageProps.name}".`);
	}

	commit('updatePassage', {passageId, passageProps, storyId});
}

export function updatePassageSize(
	{commit, getters},
	{passageId, passageSizeDescription, storyId}
) {
	const size = passageSizes[passageSizeDescription];

	if (!size) {
		throw new Error(
			`There is no size defined named '${passageSizeDescription}'`
		);
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	if (!story.passages.some(p => p.id === passageId)) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	commit('updatePassage', {
		passageId,
		storyId,
		passageProps: {height: size.height, width: size.width}
	});
}
