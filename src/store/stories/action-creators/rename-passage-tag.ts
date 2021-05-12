import {Thunk} from 'react-hook-thunk-reducer';
import {
	Passage,
	StoriesState,
	Story,
	UpdatePassagesAction
} from '../stories.types';
import {isValidTagName} from '../../../util/tag';

export function renamePassageTag(
	story: Story,
	oldName: string,
	newName: string
): Thunk<StoriesState, UpdatePassagesAction> {
	if (!isValidTagName(newName)) {
		throw new Error(`"${newName}" is not a valid tag name.`);
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
