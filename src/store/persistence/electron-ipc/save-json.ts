import {TwineElectronWindow} from '../../../electron/shared';

export function saveJson(filename: string, data: any) {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	twineElectron.saveJson(filename, data);
}
