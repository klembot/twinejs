import {Story, UpdateStoryAction} from '../stories.types';
import {storyFilename} from '../../../util/publish';

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
		stories
			.filter(s => storyFilename(s) === storyFilename({...s, ...props}))
			.some(s => s.id !== story.id)
	) {
		throw new Error(`There is already a story named "${props.name}".`);
	}

	return {
		props,
		storyId: story.id,
		type: 'updateStory'
	};
}
