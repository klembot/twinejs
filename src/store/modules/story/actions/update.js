export function updateStory({commit, getters}, {storyId, storyProps}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	commit('updateStory', {storyId, storyProps});
}
