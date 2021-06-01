import {Thunk} from 'react-hook-thunk-reducer';
import {Color} from '../../../util/color';
import {isValidTagName} from '../../../util/tag';
import {StoriesState, Story, UpdateStoryAction} from '../stories.types';

export function setTagColor(
	story: Story,
	name: string,
	color: Color
): Thunk<StoriesState, UpdateStoryAction> {
	if (!isValidTagName(name)) {
		throw new Error(`"${name}" is not a valid tag name.`);
	}

	return dispatch => {
		// Special handling: if the color is set to none, just delete it.

		if (color === 'none') {
			if (name in story.tagColors) {
				const tagColors = {...story.tagColors};

				delete tagColors[name];

				dispatch({
					type: 'updateStory',
					props: {tagColors},
					storyId: story.id
				});
			}
		} else {
			dispatch({
				type: 'updateStory',
				props: {tagColors: {...story.tagColors, [name]: color}},
				storyId: story.id
			});
		}
	};
}
