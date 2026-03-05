import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesAction, StoriesState, Story} from '../stories.types';

/**
 * Deletes a tag from all stories (story-level tags only, not passage tags or colors).
 */
export function deleteTagFromAllStories(
	stories: Story[],
	tagName: string
): Thunk<StoriesState, StoriesAction> {
	return dispatch => {
		stories.forEach(story => {
			// Remove tag from story.tags if present
			if (story.tags.includes(tagName)) {
				dispatch({
					type: 'updateStory',
					storyId: story.id,
					props: {
						tags: story.tags.filter(tag => tag !== tagName)
					}
				});
			}
		});
	};
}
