import {Thunk} from 'react-hook-thunk-reducer';
import {
	Passage,
	StoriesState,
	Story,
	StorySearchFlags,
	UpdatePassagesAction
} from '../stories.types';
import {passagesMatchingSearch} from '../getters';

export function highlightPassagesMatchingSearch(
	story: Story,
	search: string,
	flags: StorySearchFlags
): Thunk<StoriesState, UpdatePassagesAction> {
	return dispatch => {
		let passageUpdates: Record<string, Partial<Passage>> = {};

		if (search === '') {
			// Remove all highlights.
			passageUpdates = story.passages.reduce((result, passage) => {
				if (passage.highlighted) {
					return {...result, [passage.id]: {highlighted: false}};
				}

				return result;
			}, {});
		} else {
			const matchIds = passagesMatchingSearch(
				story.passages,
				search,
				flags
			).map(passage => passage.id);

			story.passages.forEach(passage => {
				const oldHighlighted = passage.highlighted;
				const newHighlighted = matchIds.includes(passage.id);

				if (newHighlighted !== oldHighlighted) {
					passageUpdates[passage.id] = {highlighted: newHighlighted};
				}
			});
		}
		if (Object.keys(passageUpdates).length > 0) {
			dispatch({
				passageUpdates,
				type: 'updatePassages',
				storyId: story.id
			});
		}
	};
}
