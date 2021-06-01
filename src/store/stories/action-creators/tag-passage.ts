import {Passage, Story, UpdatePassageAction} from '../stories.types';
import {isValidTagName} from '../../../util/tag';

/**
 * Adds a tag to a passage.
 */
export function addPassageTag(
	story: Story,
	passage: Passage,
	tagName: string
): UpdatePassageAction {
	if (passage.story !== story.id) {
		throw new Error('This passage does not belong to this story.');
	}

	if (!isValidTagName(tagName)) {
		throw new Error(`"${tagName}" is not a valid tag name.`);
	}

	if (passage.tags.includes(tagName)) {
		throw new Error(`This passage already has the tag "${tagName}".`);
	}

	return {
		type: 'updatePassage',
		passageId: passage.id,
		storyId: story.id,
		props: {tags: [...passage.tags, tagName]}
	};
}

/**
 * Removes a tag from a passage.
 */
export function removePassageTag(
	story: Story,
	passage: Passage,
	tagName: string
): UpdatePassageAction {
	if (passage.story !== story.id) {
		throw new Error('This passage does not belong to this story.');
	}

	if (!isValidTagName(tagName)) {
		throw new Error(`"${tagName}" is not a valid tag name.`);
	}

	if (!passage.tags.includes(tagName)) {
		throw new Error(`This passage does not have the tag "${tagName}".`);
	}

	return {
		type: 'updatePassage',
		passageId: passage.id,
		storyId: story.id,
		props: {tags: passage.tags.filter(t => t !== tagName)}
	};
}
