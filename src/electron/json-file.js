/*
Manages reading and writing JSON files to the application data folder. This
listens to the `save-json` IPC event.
*/

import {app, ipcMain} from 'electron';
import fs from 'fs-extra';
import path from 'path';

/*
Returns a promise resolving to the contents of a JSON file in the app data
folder. The promise rejects if there are any problems reading the file,
including if the file does not exist.
*/

export function load(filename) {
	return fs.readJson(path.join(app.getPath('userData'), filename));
}

/*
Saves an object to JSON in the app data folder. Returns a promise when done.
*/

export function save(filename, data) {
	return fs.writeJson(path.join(app.getPath('userData'), filename), data);
}

ipcMain.on('save-json', (e, filename, data) => {
	save(filename, data);
});
