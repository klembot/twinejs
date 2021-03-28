import uuid from 'tiny-uuid';
import {passageDefaults} from '../defaults';
import {Passage, Story, StoriesState} from '../stories.types';
import {storyWithId} from '../getters';

export function createPassage(
	state: StoriesState,
	storyId: string,
	passageProps: Partial<Passage>
) {
	const newState = [...state];
	let story: Story;

	try {
		story = storyWithId(newState, storyId);
	} catch (e) {
		console.warn(
			`No story in state with ID "${storyId}", taking no action`,
			e
		);
		return state;
	}

	const newPassage: Passage = {
		...passageDefaults(),
		id: uuid(),
		story: story.id,
		...passageProps
	};

	story.passages = [...story.passages, newPassage];

	if (story.passages.length === 1) {
		story.startPassage = newPassage.id;
	}

	story.lastUpdate = new Date();
	return newState;
}
