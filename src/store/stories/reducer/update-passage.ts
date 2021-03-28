import {Passage, StoriesState} from '../stories.types';

export function updatePassage(
	state: StoriesState,
	storyId: string,
	passageId: string,
	passageProps: Partial<Passage>
) {
	let updated = false;
	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		return {
			...story,
			passages: story.passages.map(passage => {
				if (passage.id !== passageId) {
					return passage;
				}

				updated = true;
				return {...passage, ...passageProps};
			})
		};
	});

	if (!updated) {
		console.warn(
			`Asked to update a story with ID "${storyId}", but it does not exist in state`
		);
	}

	return newState;
}
