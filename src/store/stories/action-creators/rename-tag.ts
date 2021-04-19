import {Thunk} from 'react-hook-thunk-reducer';
import {
	Passage,
	StoriesState,
	Story,
	UpdatePassagesAction
} from '../stories.types';

export function renameTag(
	story: Story,
	oldName: string,
	newName: string
): Thunk<StoriesState, UpdatePassagesAction> {
	if (newName.includes(' ')) {
		throw new Error('Tag names may not contain spaces.');
	}

	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		story.passages.forEach(passage => {
			if (passage.tags.includes(oldName)) {
				passageUpdates[passage.id] = {
					tags: passage.tags.map(tag => (tag === oldName ? newName : tag))
				};
			}
		});

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({type: 'updatePassages', passageUpdates, storyId: story.id});
		}
	};
}
