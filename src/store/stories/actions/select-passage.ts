import {Rect, rectIntersects} from '../../../util/geometry';
import {Passage, StoriesDispatch, Story} from '../stories.types';

/**
 * Deselects all passages.
 */
export function deselectAllPassages(dispatch: StoriesDispatch, story: Story) {
	story.passages.forEach(passage => {
		if (passage.selected) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {selected: false},
				storyId: story.id
			});
		}
	});
}

/**
 * Deselects a single passage.
 */
export function deselectPassage(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage
) {
	if (passage.selected) {
		dispatch({
			type: 'updatePassage',
			passageId: passage.id,
			props: {selected: false},
			storyId: story.id
		});
	}
}

/**
 * Selects all passages.
 */
export function selectAllPassages(dispatch: StoriesDispatch, story: Story) {
	story.passages.forEach(passage => {
		if (!passage.selected) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {selected: true},
				storyId: story.id
			});
		}
	});
}

/**
 * Selects a single passage.
 */
export function selectPassage(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage,
	exclusive: boolean
) {
	if (!passage.selected) {
		dispatch({
			type: 'updatePassage',
			passageId: passage.id,
			props: {selected: true},
			storyId: story.id
		});
	}

	if (exclusive) {
		story.passages.forEach(p => {
			if (p.id !== passage.id && p.selected) {
				dispatch({
					type: 'updatePassage',
					passageId: p.id,
					props: {selected: false},
					storyId: story.id
				});
			}
		});
	}
}

export function selectPassagesInRect(
	dispatch: StoriesDispatch,
	story: Story,
	rect: Rect,
	ignoreIds: string[] = []
) {
	story.passages.forEach(passage => {
		if (ignoreIds.find(r => r === passage.id)) {
			// We are ignoring this passage, e.g. this is an additive selection and it
			// was already selected.
			return;
		}

		const selected = rectIntersects(rect, passage);

		if (passage.selected !== selected) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {selected},
				storyId: story.id
			});
		}
	});
}
