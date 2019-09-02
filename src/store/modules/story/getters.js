/*
Functions for finding a particular story in the state, or a
particular passage in a story.
*/

export function storyWithId(state, id) {
	let story = state.stories.find(s => s.id === id);

	if (!story) {
		console.warn(`No story exists with ID "${id}"`);
	}

	return story;
}

export function passageInStoryWithId(story, id) {
	let passage = story.passages.find(p => p.id === id);

	if (!passage) {
		throw new Error(
			`No passage with ID "${id}" exists in the story with ID "${story.id}"`
		);
	}

	return passage;
}
