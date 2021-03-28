import uuid from 'tiny-uuid';
import {passageDefaults, storyDefaults} from '../defaults';
import {Story, StoriesState} from '../stories.types';

export function createStory(state: StoriesState, storyProps: Partial<Story>) {
	let story: Story = {
		id: uuid(),
		...storyDefaults(),
		ifid: uuid().toUpperCase(),
		lastUpdate: new Date(),
		passages: [],
		tagColors: {},
		...storyProps
	};

	// If we are prepopulating the story with passages, make sure they have the
	// correct ID linkage, and at least meake sure basic properties are set.

	story.passages = story.passages.map(passage => ({
		...passageDefaults,
		...passage,
		story: story.id
	}));

	return [...state, story];
}
