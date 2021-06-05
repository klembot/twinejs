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
	const shouldSave =
		action.type === 'create' ||
		action.type === 'delete' ||
		action.type === 'repair' ||
		(action.type === 'update' &&
			Object.keys(action.props).some(
				key => !['loadError', 'loadState', 'properties'].includes(key)
			));

	if (shouldSave) {
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
