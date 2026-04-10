import {v4 as uuid} from '@lukeed/uuid';
import {CreateStoryAction, Story} from '../stories.types';
import {unusedName} from '../../../util/unused-name';

/**
 * Creates a duplicate of an existing story.
 */
export function duplicateStory(
	story: Story,
	stories: Story[]
): CreateStoryAction {
	const id = uuid();
	const duplicatedPassages = story.passages.map(passage => ({
		...passage,
		id: uuid(),
		story: id
	}));
	const originalStartPassage = story.passages.find(
		({id}) => id === story.startPassage
	);

	return {
		type: 'createStory',
		props: {
			...story,
			id,
			ifid: uuid(),
			name: unusedName(
				story.name,
				stories.map(story => story.name)
			),
			passages: duplicatedPassages,
			startPassage: originalStartPassage
				? duplicatedPassages.find(
						({name}) => name === originalStartPassage.name
					)?.id
				: undefined
		}
	};
}
