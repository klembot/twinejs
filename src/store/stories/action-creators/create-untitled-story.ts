import {Thunk} from 'react-hook-thunk-reducer';
import uuid from 'tiny-uuid';
import {PrefsState} from '../../prefs';
import {StoriesAction, StoriesState, Story} from '../stories.types';
import {storyDefaults} from '../defaults';
import {unusedName} from '../../../util/unused-name';

/**
 * Creates a new story with the default story format.
 */
export function createUntitledStory(
	stories: Story[],
	prefs: PrefsState,
	props: Partial<Omit<Story, 'id' | 'name'>> = {}
): Thunk<StoriesState, StoriesAction> {
	const id = uuid();
	const name = unusedName(
		storyDefaults().name,
		stories.map(story => story.name)
	);

	return dispatch => {
		dispatch({
			type: 'createStory',
			props: {
				id,
				name,
				storyFormat: prefs.storyFormat.name,
				storyFormatVersion: prefs.storyFormat.version,
				...props
			}
		});

		return id;
	};
}
