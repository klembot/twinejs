import {StoriesState} from '../stories.types';

export function deletePassage(
	state: StoriesState,
	storyId: string,
	passageId: string
) {
	let foundStory = false;
	let deleted = false;

	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		foundStory = true;

		const newStory = {
			...story,
			passages: story.passages.filter(passage => {
				if (passage.id === passageId) {
					deleted = true;
					return false;
				}

				return true;
			})
		};

		if (deleted) {
			newStory.lastUpdate = new Date();
			return newStory;
		}

		return story;
	});

	if (!foundStory) {
		console.warn(`No story in state with ID "${storyId}", taking no action`);
		return state;
	}

	if (!deleted) {
		console.warn(
			`Asked to delete a passage with ID "${passageId}", but it does not exist in story ID ${storyId}, taking no action`
		);
		return state;
	}

	return newState;
}
