import {PrefsState} from '../../../prefs';
import {TwineElectronWindow} from '../../../../electron/shared';
import {defaults} from '../../../prefs/defaults';

export async function load(): Promise<Partial<PrefsState>> {
	const {twineElectron} = window as TwineElectronWindow;
	const result: Partial<PrefsState> = {};
	const prefKeys = Object.keys(defaults());

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	const prefs = await twineElectron?.ipcRenderer.invoke('load-prefs');

	if (prefs && typeof prefs === 'object') {
		for (const key in prefs) {
			if (prefKeys.includes(key)) {
				(result as any)[key] = prefs[key];
			}
		}
	}

	return result;
}
