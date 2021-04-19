import {Thunk} from 'react-hook-thunk-reducer';
import {Passage, StoriesAction, StoriesState, Story} from '../stories.types';
import {createNewlyLinkedPassages} from './create-newly-linked-passages';

export interface UpdatePassageOptions {
	dontCreateNewlyLinkedPassages?: boolean;
}

/**
 * General update of a passage.
 */
export function updatePassage(
	story: Story,
	passage: Passage,
	props: Partial<Passage>,
	options: UpdatePassageOptions = {}
): Thunk<StoriesState, StoriesAction> {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	if (
		'name' in props &&
		story.passages
			.filter(p => p.name === props.name)
			.some(p => p.id !== passage.id)
	) {
		throw new Error(`There is already a passage named "${props.name}".`);
	}

	return dispatch => {
		// Do the passage update itself.

		const oldText = passage.text;

		dispatch({
			props,
			type: 'updatePassage',
			passageId: passage.id,
			storyId: story.id
		});

		// Side effects from changes.
		// TODO: update links if the passage name changed

		if (!options.dontCreateNewlyLinkedPassages && props.text) {
			dispatch(createNewlyLinkedPassages(story, passage, props.text, oldText));
		}
	};
}
