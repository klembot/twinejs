const {app, ipcMain, shell} = require('electron');
const fs = require('fs-extra');
const path = require('path');
const uuid = require('tiny-uuid');

function openWithTempFile(data, suffix) {
	const tempPath = path.join(app.getPath('temp'), uuid() + suffix);

	return fs.writeFile(tempPath, data).then(() => shell.openItem(tempPath));
}

ipcMain.on('open-with-temp-file', (event, data, suffix) =>
	openWithTempFile(data, suffix)
);

module.exports = openWithTempFile;
