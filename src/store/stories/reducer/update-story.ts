import {Story, StoriesState} from '../stories.types';
import {isPersistableStoryChange} from '../../persistence/persistable-changes';

export function updateStory(
	state: StoriesState,
	storyId: string,
	storyProps: Partial<Omit<Story, 'id'>>
) {
	if (
		'name' in storyProps &&
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

		const updatedStory = {...story, ...storyProps};

		if (isPersistableStoryChange(storyProps)) {
			updatedStory.lastUpdate = new Date();
		}

		return updatedStory;
	});

	if (!updated) {
		console.warn(
			`Asked to update a story with ID "${storyId}", but it does not exist in state`
		);
		return state;
	}

	return newState;
}
