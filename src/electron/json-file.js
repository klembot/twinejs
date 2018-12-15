/*
Manages reading and writing JSON files to the application data folder. This
listens to the `save-json` IPC event.
*/

const {app, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const util = require('util');

const JsonFile = (module.exports = {
	/*
	Returns a promise resolving to the contents of a JSON file in the app data
	folder. The promise rejects if there are any problems reading the file,
	including if the file does not exist.
	*/

	load(filename) {
		const readFile = util.promisify(fs.readFile);

		return readFile(path.join(app.getPath('userData'), filename), {
			encoding: 'utf8'
		}).then(data => JSON.parse(data));
	},

	/*
	Saves an object to JSON in the app data folder. Returns a promise when done.
	*/

	save(filename, data) {
		const open = util.promisify(fs.open);
		const write = util.promisify(fs.write);

		return open(path.join(app.getPath('userData'), filename), 'w').then(
			fd => write(fd, JSON.stringify(data))
		);
	}
});

ipcMain.on('save-json', (e, filename, data) => {
	JsonFile.save(filename, data);
});
