import {
	Passage,
	StoriesAction,
	StoriesState,
	Story,
	UpdatePassageAction
} from '../stories.types';
import {isValidTagName} from '../../../util/tag';
import {storyPassageTags} from '../getters';
import {Thunk} from 'react-hook-thunk-reducer';
import {colorString} from '../../../util/color';

/**
 * Adds a tag to a passage.
 */
export function addPassageTag(
	story: Story,
	passage: Passage,
	tagName: string
): Thunk<StoriesState, StoriesAction> {
	if (passage.story !== story.id) {
		throw new Error('This passage does not belong to this story.');
	}

	if (!isValidTagName(tagName)) {
		throw new Error(`"${tagName}" is not a valid tag name.`);
	}

	if (passage.tags.includes(tagName)) {
		throw new Error(`This passage already has the tag "${tagName}".`);
	}

	return dispatch => {
		// If this is the first time a tag is being added to this story, assign it a
		// color.

		if (!storyPassageTags(story).includes(tagName)) {
			dispatch({
				type: 'updateStory',
				storyId: story.id,
				props: {
					tagColors: {
						...story.tagColors,
						[tagName]: colorString(tagName)
					}
				}
			});
		}

		dispatch({
			type: 'updatePassage',
			passageId: passage.id,
			storyId: story.id,
			props: {tags: [...passage.tags, tagName]}
		});
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
