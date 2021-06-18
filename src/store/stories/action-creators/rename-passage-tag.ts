import {Thunk} from 'react-hook-thunk-reducer';
import {
	Passage,
	StoriesState,
	Story,
	UpdatePassagesAction,
	UpdateStoryAction
} from '../stories.types';
import {isValidTagName} from '../../../util/tag';

export function renamePassageTag(
	story: Story,
	oldName: string,
	newName: string
): Thunk<StoriesState, UpdatePassagesAction | UpdateStoryAction> {
	if (!isValidTagName(newName)) {
		throw new Error(`"${newName}" is not a valid tag name.`);
	}

	return dispatch => {
		// Change tags in passages.

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

			// Move the tag color to the new one.

			const tagColors = {...story.tagColors};

			delete tagColors[oldName];
			tagColors[newName] = story.tagColors[oldName];
			dispatch({
				type: 'updateStory',
				props: {tagColors},
				storyId: story.id
			});
		}
	};
}
