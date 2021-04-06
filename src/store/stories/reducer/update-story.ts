import {Story, StoriesState} from '../stories.types';

export function updateStory(
	state: StoriesState,
	storyId: string,
	storyProps: Omit<Partial<Story>, 'id'>
) {
	if (
		storyProps.name &&
		state.some(story => story.name === storyProps.name && story.id !== storyId)
	) {
		console.warn(
			`There is another story in state with name "${storyProps.name}", taking no action`
		);
		return state;
	}

	let updated = false;
	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		updated = true;
		return {...story, ...storyProps, lastUpdate: new Date()};
	});

	if (!updated) {
		console.warn(
			`Asked to update a story with ID "${storyId}", but it does not exist in state`
		);
		return state;
	}

	return newState;
}
