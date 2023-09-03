import {app, shell} from 'electron';
import { writeFile, remove } from 'fs-extra';
import path from 'path';
import uuid from 'tiny-uuid';

let oldtmp:string|null = null;

function deleteTempFile(path: string|null, required_subroot: string) {
	if (path != null && path.startsWith(required_subroot)) {
		remove(path, () => {
			oldtmp = null;
			console.debug(`Temporary file ${path} deleted.`);
		});
	}
}

export async function openWithTempFile(data: string, suffix: string, delete_next: boolean = true) {
	const tempSubRoot: string = app.getPath('temp');
	const tempPath: string = path.join(tempSubRoot, uuid() + suffix);

	deleteTempFile(oldtmp, tempSubRoot)
	await writeFile(tempPath, data);
	if (delete_next === true) oldtmp = tempPath;
	shell.openPath(tempPath);
}

app.on('will-quit', () => {
	const tempSubRoot: string = app.getPath('temp');
	deleteTempFile(oldtmp, tempSubRoot);
});
