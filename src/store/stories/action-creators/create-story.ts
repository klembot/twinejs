import {Thunk} from 'react-hook-thunk-reducer';
import uuid from 'tiny-uuid';
import {PrefsState} from '../../prefs';
import {StoriesAction, StoriesState, Story} from '../stories.types';

/**
 * Creates a new story with the default story format.
 */
export function createStory(
	stories: Story[],
	prefs: PrefsState,
	props: Partial<Omit<Story, 'id'>> & Pick<Story, 'name'>
): Thunk<StoriesState, StoriesAction> {
	const id = uuid();

	if (props.name.trim() === '') {
		throw new Error('Story name cannot be empty');
	}

	if (
		stories.some(story => story.name.toLowerCase() === props.name.toLowerCase())
	) {
		throw new Error(`There is already a story named "${props.name}"`);
	}

	return dispatch => {
		dispatch({
			type: 'createStory',
			props: {
				id,
				storyFormat: prefs.storyFormat.name,
				storyFormatVersion: prefs.storyFormat.version,
				...props
			}
		});

		return id;
	};
}
