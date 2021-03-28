import {StoriesDispatch, Story} from '../stories.types';

/**
 * Moves passages by an offset, e.g. after dragging.
 */
export function movePassages(
	dispatch: StoriesDispatch,
	story: Story,
	passageIds: string[],
	xChange: number,
	yChange: number
) {
	passageIds.forEach(passageId => {
		const passage = story.passages.find(p => p.id === passageId);

		if (!passage) {
			throw new Error(
				`There is no passage in this story with ID "${passageId}".`
			);
		}

		// TODO: clean up overlaps

		let left = passage.left + xChange;
		let top = passage.top + yChange;

		if (story.snapToGrid) {
			left = Math.round(left / 25) * 25;
			top = Math.round(top / 25) * 25;
		}

		dispatch({
			type: 'updatePassage',
			passageId,
			storyId: story.id,
			props: {left, top}
		});
	});
}
