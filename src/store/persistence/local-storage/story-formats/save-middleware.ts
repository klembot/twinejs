import {StoryFormatsAction, StoryFormatsState} from '../../../story-formats';
import {isPersistableStoryFormatChange} from '../../persistable-changes';
import {save} from './save';

/**
 * A middleware function to save changes to local storage. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(
	state: StoryFormatsState,
	action: StoryFormatsAction
) {
	switch (action.type) {
		case 'create':
		case 'delete':
		case 'repair':
			save(state);
			break;

		case 'update':
			// Is this a significant update?
			if (isPersistableStoryFormatChange(action.props)) {
				save(state);
			}
			break;
	}
}
