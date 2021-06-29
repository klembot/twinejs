import {app, shell} from 'electron';
import {writeFile} from 'fs-extra';
import path from 'path';
import uuid from 'tiny-uuid';

export async function openWithTempFile(data: string, suffix: string) {
	const tempPath = path.join(app.getPath('temp'), uuid() + suffix);

	await writeFile(tempPath, data);
	shell.openPath(tempPath);
}
