import {Passage, Story, StoriesState} from '../stories.types';
import {storyWithId} from '../getters';

export function updatePassage(
	state: StoriesState,
	storyId: string,
	passageId: string,
	passageProps: Omit<Partial<Passage>, 'id' | 'story'>
) {
	const newState = [...state];
	let story: Story;
	let updated = false;

	try {
		story = storyWithId(newState, storyId);
	} catch (e) {
		console.warn(`No story in state with ID "${storyId}", taking no action`, e);
		return state;
	}

	if (
		passageProps.name &&
		story.passages.some(
			passage => passage.id !== passageId && passage.name === passageProps.name
		)
	) {
		console.warn(
			`There is already a passage in this story with name "${passageProps.name}", taking no action`
		);
		return state;
	}

	story.passages = story.passages.map(passage => {
		if (passage.id !== passageId) {
			return passage;
		}

		updated = true;
		return {...passage, ...passageProps};
	});

	if (!updated) {
		console.warn(
			`Asked to update a passage with ID "${passageId}", but it does not exist in story ID ${storyId}, taking no action`
		);
		return state;
	}

	story.lastUpdate = new Date();
	return newState;
}
