import uuid from 'tiny-uuid';
import {CreateStoryAction, Story} from '../stories.types';
import {unusedName} from '../../../util/unused-name';

/**
 * Creates a duplicate of an existing story.
 */
export function duplicateStory(
	story: Story,
	stories: Story[]
): CreateStoryAction {
	return {
		type: 'createStory',
		props: {
			...story,
			id: uuid(),
			ifid: uuid(),
			name: unusedName(
				story.name,
				stories.map(story => story.name)
			)
		}
	};
}
