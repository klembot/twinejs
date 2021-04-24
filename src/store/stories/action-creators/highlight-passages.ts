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
		const matchIds = passagesMatchingSearch(story.passages, search, flags).map(
			passage => passage.id
		);
		let passageUpdates: Record<string, Partial<Passage>> = {};

		story.passages.forEach(passage => {
			const oldHighlighted = passage.highlighted;
			const newHighlighted = matchIds.includes(passage.id);

			if (newHighlighted !== oldHighlighted) {
				passageUpdates[passage.id] = {highlighted: newHighlighted};
			}
		});

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({
				passageUpdates,
				type: 'updatePassages',
				storyId: story.id
			});
		}
	};
}
