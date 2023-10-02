import {app, shell} from 'electron';
import {mkdirp, readdir, remove, stat, writeFile} from 'fs-extra';
import {join} from 'path';
import {i18n} from './locales';
import {getAppPref} from './app-prefs';

/**
 * Returns the path to the scratch directory. This can be overridden by the app
 * pref `scratchFolderPath`.
 */
export function scratchDirectoryPath() {
	const folderPref = getAppPref('scratchFolderPath');

	return typeof folderPref === 'string'
		? folderPref
		: join(
				app.getPath('documents'),
				i18n.t('common.appName'),
				i18n.t('electron.scratchDirectoryName')
		  );
}

/**
 * Deletes all files in the scratch directory older than either 3 days, or a
 * number of minutes set in the `scratchFileCleanupAge` app preference.
 */
export async function cleanScratchDirectory() {
	console.log('Cleaning scratch directory');

	// Coerce the app pref to an integer. If it was set via CLI argument, it may
	// come in as a string.
	const agePref =
		getAppPref('scratchFileCleanupAge') !== undefined
			? parseInt((getAppPref('scratchFileCleanupAge') as object).toString())
			: NaN;

	// milliseconds -> seconds -> minutes -> hours -> days
	const tooOld = 1000 * 60 * (isFinite(agePref) ? agePref : 60 * 24 * 3);
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
