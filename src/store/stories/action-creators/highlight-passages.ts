import {Thunk} from 'react-hook-thunk-reducer';
import {
	Passage,
	StoriesState,
	Story,
	UpdatePassagesAction
} from '../stories.types';

export function highlightPassages(
	story: Story,
	passageIds: string[]
): Thunk<StoriesState, UpdatePassagesAction> {
	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		for (const passage of story.passages) {
			const oldHighlighted = passage.highlighted;
			const newHighlighted = passageIds.includes(passage.id);

			if (newHighlighted !== oldHighlighted) {
				passageUpdates[passage.id] = {highlighted: newHighlighted};
			}
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
