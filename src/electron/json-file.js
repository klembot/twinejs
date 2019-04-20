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
		const close = util.promisify(fs.close);
		const open = util.promisify(fs.open);
		const write = util.promisify(fs.write);

		let openFile;

		return open(path.join(app.getPath('userData'), filename), 'w')
			.then(fd => {
				openFile = fd;
				return write(fd, JSON.stringify(data));
			})
			.finally(() => {
				if (openFile) {
					return close(openFile);
				}
			});
	}
});

ipcMain.on('save-json', (e, filename, data) => {
	JsonFile.save(filename, data);
});
