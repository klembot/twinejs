import {StoriesDispatch, Passage, Story} from '../stories.types';

/**
 * Deletes a passage.
 */
export function deletePassage(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage
) {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	dispatch({type: 'deletePassage', storyId: story.id, passageId: passage.id});
}

/**
 * Deletes multiple passages.
 */
export function deletePassages(
	dispatch: StoriesDispatch,
	story: Story,
	passages: Passage[]
) {
	passages.forEach(passage => deletePassage(dispatch, story, passage));
}
