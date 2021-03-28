import {PrefsDispatch, PrefsState} from './prefs.types';

export function setPref(
	dispatch: PrefsDispatch,
	name: keyof PrefsState,
	value: boolean | number | string | {name: string; version: string}
) {
	dispatch({type: 'update', name, value});
}
