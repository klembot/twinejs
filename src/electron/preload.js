/*
Exposes a limited set of Electron modules to a renderer process. Because the
renderer processes load rmeote content (e.g. story formats), they must be
isolated.
*/

import jsonp from 'jsonp';

import {ipcRenderer, remote} from 'electron';

window.twineElectron = {
	hydrate: remote.getGlobal('hydrate'),
	ipcRenderer,
	jsonp
};
