// Our Electron preload script defines certain globals that browser contexts may
// use.
import {IpcRenderer} from 'electron';
import jsonp from 'jsonp';
import {StoryFile} from '../main-process/story-file';

export interface TwineElectronWindow extends Window {
	twineElectron?: {
		hydrate: {
			prefs: Record<string, any>;
			stories: StoryFile[];
			storyFormats: any[];
		};
		ipcRenderer: IpcRenderer;
		jsonp: typeof jsonp;
	};
}
