// Our Electron preload script defines certain globals that browser contexts may
// use.
import {IpcRenderer} from 'electron';
import jsonp from 'jsonp';

export interface TwineElectronWindow extends Window {
	twineElectron?: {
		ipcRenderer: IpcRenderer;
		jsonp: typeof jsonp;
	};
}
