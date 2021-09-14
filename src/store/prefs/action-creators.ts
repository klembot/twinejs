import {PrefsAction, PrefsState} from './prefs.types';
import {Color} from '../../util/color';

export function setPref(
	name: keyof PrefsState,
	value:
		| boolean
		| number
		| string
		| {name: string; version: string}
		| {name: string; version: string}[]
		| Record<string, Color>
): PrefsAction {
	return {type: 'update', name, value};
}
