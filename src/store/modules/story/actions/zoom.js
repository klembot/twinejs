export function changeZoom({commit, getters}, {change, storyId}) {
	if (typeof change !== 'number') {
		throw new Error('The change in zoom must be a number');
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/*
	Clamp between 10% and 200%.
	*/

	const newZoom = Math.max(Math.min(story.zoom + change, 2), 0.1);

	if (newZoom !== story.zoom) {
		commit('updateStory', {storyId, storyProps: {zoom: newZoom}});
	}
}
