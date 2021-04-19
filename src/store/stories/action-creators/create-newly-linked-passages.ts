import {Thunk} from 'react-hook-thunk-reducer';
import {
	CreatePassagesAction,
	Passage,
	StoriesState,
	Story
} from '../stories.types';
import {passageDefaults} from '../defaults';
import {parseLinks} from '../../../util/parse-links';

/**
 * Creates newly linked passages from a passage. You shouldn't need to call this
 * directly--it will be invoked automatically by updatePassage() if you change
 * the passage text.
 */
export function createNewlyLinkedPassages(
	story: Story,
	passage: Passage,
	newText: string,
	oldText: string
): Thunk<StoriesState, CreatePassagesAction> {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	return dispatch => {
		const oldLinks = parseLinks(oldText);
		const toCreate = parseLinks(newText).filter(
			l => !oldLinks.includes(l) && !story.passages.some(p => p.name === l)
		);

		if (toCreate.length === 0) {
			return;
		}

		const passageDefs = passageDefaults();
		const passageGap = 50;

		const top = passage.top + passage.height + passageGap;
		const newPassagesWidth =
			toCreate.length * passageDefs.width + (toCreate.length - 1) * passageGap;

		// Horizontally center the passages.

		let left = passage.left + (passage.width - newPassagesWidth) / 2;

		// TODO: prevent overlaps

		// Actually create them.

		dispatch({
			type: 'createPassages',
			storyId: story.id,
			props: toCreate.map(name => {
				const result = {left, name, top};

				left += passageDefs.width + passageGap;
				return result;
			})
		});
	};
}
