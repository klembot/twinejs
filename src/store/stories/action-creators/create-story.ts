import {PrefsState} from '../../prefs';
import {CreateStoryAction, Story} from '../stories.types';

/**
 * Creates a new story with the default story format.
 */
export function createStory(
	props: Partial<Omit<Story, 'id'>> & {name: Story['name']},
	prefs: PrefsState
): CreateStoryAction {
	return {
		type: 'createStory',
		props: {
			storyFormat: prefs.storyFormat.name,
			storyFormatVersion: prefs.storyFormat.version,
			...props
		}
	};
}
