import {StoriesDispatch, Passage, Story} from '../stories.types';
import {createNewlyLinkedPassages} from './create-newly-linked-passages';

/**
 * General update of a passage.
 */
export function updatePassage(
	dispatch: StoriesDispatch,
	story: Story,
	passage: Passage,
	props: Partial<Passage>
) {
	if (
		props.name &&
		story.passages
			.filter(p => p.name === props.name)
			.some(p => p.id !== passage.id)
	) {
		throw new Error(`There is already a passage named "${props.name}".`);
	}

	const oldText = passage.text;

	// Do the passage update itself.

	dispatch({
		props,
		type: 'updatePassage',
		passageId: passage.id,
		storyId: story.id
	});

	// Side effects from changes.
	// TODO: update links if the passage name changed

	if (props.text) {
		createNewlyLinkedPassages(
			dispatch,
			story,
			passage,
			props.text,
			oldText
		);
	}
}
