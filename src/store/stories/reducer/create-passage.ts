import uuid from 'tiny-uuid';
import {passageDefaults} from '../defaults';
import {Passage, Story, StoriesState} from '../stories.types';

export function createPassage(
	state: StoriesState,
	storyId: string,
	passageProps: Partial<Passage>
) {
	let storyExists = false;
	let created = false;
	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		storyExists = true;

		if (story.passages.some(passage => passage.id === passageProps.id)) {
			console.warn(
				`There is already a passage in this story with ID "${passageProps.id}", taking no action`
			);
			return story;
		}

		if (
			'name' in passageProps &&
			story.passages.some(passage => passage.name === passageProps.name)
		) {
			console.warn(
				`There is already a passage in this story with name "${passageProps.name}", taking no action`
			);
			return story;
		}

		const newPassage: Passage = {
			...passageDefaults(),
			id: uuid(),
			...passageProps,
			story: story.id
		};
		const newStory: Story = {
			...story,
			lastUpdate: new Date(),
			passages: [...story.passages, newPassage]
		};

		if (newStory.passages.length === 1) {
			newStory.startPassage = newPassage.id;
		}

		created = true;
		return newStory;
	});

	if (!storyExists) {
		console.warn(`No story in state with ID "${storyId}", taking no action`);
		return state;
	}

	if (!created) {
		// Should have warned above.
		return state;
	}

	return newState;
}
