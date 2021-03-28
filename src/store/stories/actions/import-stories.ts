import {StoriesDispatch, Story} from '../stories.types';
import {storyFilename} from '../../../util/publish';

/**
 * Imports stories, overwriting any stories with the same name.
 */
export function importStories(
	dispatch: StoriesDispatch,
	toImport: Story[],
	existingStories: Story[]
) {
	toImport.forEach(importStory => {
		// Remove the temp ID that was assigned to the new story.

		const props: Partial<Story> = {...importStory};

		delete props.id;

		const existingStory = existingStories.find(
			s => storyFilename(s) === storyFilename(importStory)
		);

		// Do an update so that if something goes awry, we won't have deleted the
		// story.

		if (existingStory) {
			dispatch({props, type: 'updateStory', storyId: existingStory.id});
		} else {
			dispatch({props, type: 'createStory'});
		}
	});
}
