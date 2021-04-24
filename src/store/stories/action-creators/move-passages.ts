import {Passage, Story, UpdatePassagesAction} from '../stories.types';

/**
 * Moves passages by an offset, e.g. after dragging.
 */
export function movePassages(
	story: Story,
	passageIds: string[],
	xChange: number,
	yChange: number
): UpdatePassagesAction {
	const passageUpdates: Record<string, Partial<Passage>> = {};

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

		passageUpdates[passage.id] = {left, top};
	});

	return {type: 'updatePassages', passageUpdates, storyId: story.id};
}
