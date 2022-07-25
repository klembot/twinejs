import {Thunk} from 'react-hook-thunk-reducer';
import {parseLinks} from '../../../util/parse-links';
import {passageIsEmpty} from '../../../util/passage-is-empty';
import {
	DeletePassagesAction,
	Passage,
	StoriesState,
	Story
} from '../stories.types';

/**
 * Deletes empty, orphaned passages from a story after passage text changes. An orphan
 * must meet all these criteria:
 *
 * - It is considered empty (see util/passage-is-empty.ts)
 * - It is not the story start
 * - It was linked previously from the passage, but is not anymore
 * - It is only linked to from the passage whose text is changing
 *
 * The intent is to delete passages that were automatically created in the past,
 * but the user has removed the link through editing without ever editing the
 * passage.
 */
export function deleteOrphanedPassages(
	story: Story,
	passage: Passage,
	newText: string,
	oldText: string
): Thunk<StoriesState, DeletePassagesAction> {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	return dispatch => {
		const oldLinks = parseLinks(oldText);
		const newLinks = parseLinks(newText);
		const orphans = oldLinks.filter(link => !newLinks.includes(link));

		const passageIds = orphans.reduce<string[]>((result, orphan) => {
			const orphanPassage = story.passages.find(p => p.name === orphan);

			// These tests are fast because they look at the passage object only.

			if (
				!orphanPassage ||
				!passageIsEmpty(orphanPassage) ||
				story.startPassage === orphanPassage.id
			) {
				return result;
			}

			// This is O(n) potentially.

			if (
				story.passages.some(
					p => p.id !== passage.id && parseLinks(p.text).includes(orphan)
				)
			) {
				return result;
			}

			return [...result, orphanPassage.id];
		}, []);

		if (passageIds.length > 0) {
			dispatch({type: 'deletePassages', passageIds, storyId: story.id});
		}
	};
}
