// Exposes a limited set of Electron modules to a renderer process. Because the
// renderer processes load remote content (e.g. story formats), they must be
// isolated.

import jsonp from 'jsonp';
import {contextBridge, ipcRenderer, remote} from 'electron';

process.once('loaded', () => {
	contextBridge.exposeInMainWorld('twineElectron', {
		hydrate: remote.getGlobal('hydrate'),
		ipcRenderer,
		jsonp
	});
});
