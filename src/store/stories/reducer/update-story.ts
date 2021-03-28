import {Story, StoriesState} from '../stories.types';

export function updateStory(
	state: StoriesState,
	storyId: string,
	storyProps: Partial<Story>
) {
	let updated = false;
	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		// Clamp zoom and update last updated date.

		const update: Story = {...story, ...storyProps, lastUpdate: new Date()};

		if (update.zoom) {
			update.zoom = Math.max(Math.min(update.zoom, 2), 0.1);
		}

		updated = true;
		return update;
	});

	if (!updated) {
		console.warn(
			`Asked to update a story with ID "${storyId}", but it does not exist in state`
		);
	}

	return newState;
}
