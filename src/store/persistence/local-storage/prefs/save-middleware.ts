import {PrefsAction, PrefsState} from '../../../prefs';
import {save} from './save';

export function saveMiddleware(state: PrefsState, action: PrefsAction) {
	if (action.type === 'update') {
		save(state);
	}
}
