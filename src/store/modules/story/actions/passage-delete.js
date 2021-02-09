export function deletePassages({commit, getters}, {passageIds, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/*
	As painful as it is to double-loop, it seems important to validate that all
	passageIds are legit before taking any action.
	*/

	passageIds.forEach(passageId => {
		if (!story.passages.some(p => p.id === passageId)) {
			throw new Error(
				`There is no passage in this story with ID "${passageId}".`
			);
		}
	});

	passageIds.forEach(passageId =>
		commit('deletePassage', {passageId, storyId})
	);
}
