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
		console.warn(`No story in state with ID "${storyId}", taking no action`, e);
		return state;
	}

	if (
		passageProps.id &&
		story.passages.some(passage => passage.id === passageProps.id)
	) {
		console.warn(
			`There is already a passage in this story with ID "${passageProps.id}", taking no action`
		);
		return state;
	}

	if (
		passageProps.name &&
		story.passages.some(passage => passage.name === passageProps.name)
	) {
		console.warn(
			`There is already a passage in this story with name "${passageProps.name}", taking no action`
		);
		return state;
	}

	const newPassage: Passage = {
		...passageDefaults(),
		id: uuid(),
		...passageProps,
		story: story.id
	};

	story.passages = [...story.passages, newPassage];

	if (story.passages.length === 1) {
		story.startPassage = newPassage.id;
	}

	story.lastUpdate = new Date();
	return newState;
}
