import {PrefsAction, PrefsState} from './prefs.types';

export function setPref(
	name: keyof PrefsState,
	value: boolean | number | string | {name: string; version: string}
): PrefsAction {
	return {type: 'update', name, value};
}
