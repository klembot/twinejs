import {Passage, StoriesDispatch, Story} from '../stories.types';

/**
 * Adds a tag to a passage.
 */
export function addPassageTag(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage,
	tagName: string
) {
	if (tagName.includes(' ')) {
		throw new Error('Tag names may not contain spaces.');
	}

	if (passage.tags.includes(tagName)) {
		throw new Error(`This passage already has the tag "${tagName}".`);
	}

	dispatch({
		type: 'updatePassage',
		passageId: passage.id,
		storyId: story.id,
		props: {tags: [...passage.tags, tagName]}
	});
}

/**
 * Removes a tag from a passage.
 */
export function removePassageTag(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage,
	tagName: string
) {
	if (!passage.tags.includes(tagName)) {
		throw new Error(`This passage does not have the tag "${tagName}".`);
	}

	dispatch({
		type: 'updatePassage',
		passageId: passage.id,
		storyId: story.id,
		props: {tags: passage.tags.filter(t => t !== tagName)}
	});
}
