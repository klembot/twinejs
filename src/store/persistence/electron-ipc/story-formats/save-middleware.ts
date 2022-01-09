import {StoryFormatsAction, StoryFormatsState} from '../../../story-formats';
import {isPersistableStoryFormatChange} from '../../persistable-changes';
import {saveJson} from '../save-json';

/**
 * A middleware function to save changes to disk. This should be called
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
		(action.type === 'update' && isPersistableStoryFormatChange(action.props));

	if (shouldSave) {
		saveJson(
			'story-formats.json',
			state.map(format => ({
				id: format.id,
				name: format.name,
				selected: undefined,
				version: format.version,
				url: format.url,
				userAdded: format.userAdded
			}))
		);
	}
}
