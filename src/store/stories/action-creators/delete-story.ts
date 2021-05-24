import {StoriesAction, Story} from '../stories.types';

export function deleteStory(story: Story): StoriesAction {
	return {type: 'deleteStory', storyId: story.id};
}
