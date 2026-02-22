import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesAction, StoriesState, Story, Passage} from '../stories.types';

/**
 * Deletes a tag from all stories and all their passages globally.
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

			// Remove tag from tagColors if present
			if (story.tagColors && story.tagColors[tagName]) {
				const tagColors = {...story.tagColors};
				delete tagColors[tagName];
				dispatch({
					type: 'updateStory',
					storyId: story.id,
					props: {tagColors}
				});
			}

			// Remove tag from all passages in this story
			const passageUpdates: Record<string, Partial<Passage>> = {};
			story.passages.forEach(passage => {
				if (passage.tags.includes(tagName)) {
					passageUpdates[passage.id] = {
						tags: passage.tags.filter(tag => tag !== tagName)
					};
				}
			});

			if (Object.keys(passageUpdates).length > 0) {
				dispatch({
					type: 'updatePassages',
					storyId: story.id,
					passageUpdates
				});
			}
		});
	};
}
