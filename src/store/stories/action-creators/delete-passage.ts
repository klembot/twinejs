import {
	Passage,
	Story,
	DeletePassageAction,
	DeletePassagesAction
} from '../stories.types';

/**
 * Deletes a passage.
 */
export function deletePassage(
	story: Story,
	passage: Passage
): DeletePassageAction {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	return {type: 'deletePassage', storyId: story.id, passageId: passage.id};
}

/**
 * Deletes multiple passages.
 */
export function deletePassages(
	story: Story,
	passages: Passage[]
): DeletePassagesAction {
	return {
		type: 'deletePassages',
		storyId: story.id,
		passageIds: passages.map(passage => passage.id)
	};
}
