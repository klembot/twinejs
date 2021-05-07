import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesAction, StoriesState, Story} from '../stories.types';
import {isValidTagName} from '../../../util/tag';

export function renameStoryTag(
	stories: Story[],
	oldName: string,
	newName: string
): Thunk<StoriesState, StoriesAction> {
	if (!isValidTagName(newName)) {
		throw new Error(`"${newName}" is not a valid tag name.`);
	}

	return dispatch => {
		stories.forEach(story => {
			if (story.tags.includes(oldName)) {
				dispatch({
					type: 'updateStory',
					storyId: story.id,
					props: {
						tags: story.tags.map(tag => (tag === oldName ? newName : tag))
					}
				});
			}
		});
	};
}
