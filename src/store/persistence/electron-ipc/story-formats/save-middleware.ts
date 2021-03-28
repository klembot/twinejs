import {StoryFormatsAction, StoryFormatsState} from '../../../story-formats';
import {saveJson} from '../save-json';

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
		saveJson(
			'story-formats.json',
			state.map(format => ({
				id: format.id,
				name: format.name,
				version: format.version,
				url: format.url,
				userAdded: format.userAdded
			}))
		);
	}
}
