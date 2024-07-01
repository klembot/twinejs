import {CreateStoryAction, Story} from '../stories.types';
import {unusedName} from '../../../util/unused-name';

/**
 * Creates a duplicate of an existing story.
 */
export function duplicateStory(
	story: Story,
	stories: Story[]
): CreateStoryAction {
	const id = window.crypto.randomUUID();

	return {
		type: 'createStory',
		props: {
			...story,
			id,
			ifid: window.crypto.randomUUID(),
			name: unusedName(
				story.name,
				stories.map(story => story.name)
			),
			passages: story.passages.map(passage => ({
				...passage,
				id: window.crypto.randomUUID(),
				story: id
			}))
		}
	};
}
