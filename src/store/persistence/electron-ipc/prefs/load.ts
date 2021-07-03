import {PrefsState} from '../../../prefs';
import {TwineElectronWindow} from '../../../../electron/shared';
import {defaults} from '../../../prefs/defaults';

export function load(): Partial<PrefsState> {
	const {twineElectron} = window as TwineElectronWindow;
	const result: Partial<PrefsState> = {};
	const prefKeys = Object.keys(defaults());

	if (
		twineElectron?.hydrate?.prefs &&
		typeof twineElectron.hydrate.prefs === 'object'
	) {
		for (const key in twineElectron.hydrate.prefs) {
			if (prefKeys.includes(key)) {
				(result as any)[key] = twineElectron.hydrate.prefs[key];
			}
		}
	}

	return result;
}
