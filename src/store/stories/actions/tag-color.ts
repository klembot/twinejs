import {Color} from '../../../util/color';
import {StoriesDispatch, Story} from '../stories.types';

export function setTagColor(
	dispatch: StoriesDispatch,
	story: Story,
	name: string,
	color: Color
) {
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
}
