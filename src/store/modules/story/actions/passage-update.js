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

	commit('updatePassage', {passageId, passageProps, storyId});
}
