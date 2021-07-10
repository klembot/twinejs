import {PrefsAction, PrefsState} from '../../../prefs';
import {saveJson} from '../save-json';

/**
 * A middleware function to save changes to disk. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(state: PrefsState, action: PrefsAction) {
	if (action.type === 'repair' || action.type === 'update') {
		saveJson('prefs.json', state);
	}
}
