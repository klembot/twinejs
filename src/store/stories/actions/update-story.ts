import {StoriesDispatch, Story} from '../stories.types';

/**
 * General update of a story.
 */
export function updateStory(
	dispatch: StoriesDispatch,
	stories: Story[],
	story: Story,
	props: Partial<Story>
) {
	if (
		props.name &&
		stories.filter(s => s.name === props.name).some(s => s.id !== story.id)
	) {
		throw new Error(`There is already a story named "${props.name}".`);
	}

	dispatch({
		props,
		storyId: story.id,
		type: 'updateStory'
	});
}
