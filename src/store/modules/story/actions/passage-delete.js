export function deletePassage({commit, getters}, {passageId, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	if (!story.passages.some(p => p.id === passageId)) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	commit('deletePassage', {passageId, storyId});
}
