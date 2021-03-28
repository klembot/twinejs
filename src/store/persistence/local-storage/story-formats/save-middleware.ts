import {StoryFormatsAction, StoryFormatsState} from '../../../story-formats';
import {save} from './save';

/**
 * A middleware function to save changes to local storage. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(
	state: StoryFormatsState,
	action: StoryFormatsAction
) {
	if (
		action.type === 'create' ||
		action.type === 'update' ||
		action.type === 'delete'
	) {
		save(state);
	}
}
