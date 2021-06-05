import {PrefsAction, PrefsState} from '../../../prefs';
import {saveJson} from '../save-json';

export function saveMiddleware(state: PrefsState, action: PrefsAction) {
	if (action.type === 'repair' || action.type === 'update') {
		saveJson('prefs.json', state);
	}
}
