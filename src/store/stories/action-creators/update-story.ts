import {Story, UpdateStoryAction} from '../stories.types';

/**
 * General update of a story.
 */
export function updateStory(
	stories: Story[],
	story: Story,
	props: Partial<Story>
): UpdateStoryAction {
	if (
		props.name &&
		stories.filter(s => s.name === props.name).some(s => s.id !== story.id)
	) {
		throw new Error(`There is already a story named "${props.name}".`);
	}

	return {
		props,
		storyId: story.id,
		type: 'updateStory'
	};
}
