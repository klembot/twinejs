import {app, shell} from 'electron';
import {mkdirp, readdir, remove, stat, writeFile} from 'fs-extra';
import {join} from 'path';
import {i18n} from './locales';

export function scratchDirectoryPath() {
	return join(
		app.getPath('documents'),
		i18n.t('common.appName'),
		i18n.t('electron.scratchDirectoryName')
	);
}

export async function cleanScratchDirectory() {
	// milliseconds -> seconds -> minutes -> hours -> days
	const tooOld = 1000 * 60 * 60 * 24 * 3;
	const now = Date.now();
	const scratchFiles = (
		await readdir(scratchDirectoryPath(), {withFileTypes: true})
	).filter(file => !file.isDirectory() && /\.html$/.test(file.name));

	return Promise.all(
		scratchFiles.map(async file => {
			const scratchFile = join(scratchDirectoryPath(), file.name);
			const stats = await stat(scratchFile);

			if (now - stats.mtimeMs > tooOld) {
				console.log(`Deleting old scratch file ${scratchFile}`);
				return await remove(scratchFile);
			}
		})
	);
}

export async function openWithScratchFile(data: string, filename: string) {
	const scratchPath = join(scratchDirectoryPath(), filename);

	await mkdirp(scratchDirectoryPath());
	await writeFile(scratchPath, data, 'utf8');
	shell.openPath(scratchPath);
}
