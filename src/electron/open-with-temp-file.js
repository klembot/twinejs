import { app, ipcMain, shell } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import uuid from 'tiny-uuid';

function openWithTempFile(data, suffix) {
	const tempPath = path.join(app.getPath('temp'), uuid() + suffix);

	return fs.writeFile(tempPath, data).then(() => shell.openItem(tempPath));
}

ipcMain.on('open-with-temp-file', (event, data, suffix) =>
	openWithTempFile(data, suffix)
);

export default openWithTempFile;
