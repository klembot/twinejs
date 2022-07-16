import {app, shell} from 'electron';
import {copy, mkdirp, readdir, remove, stat} from 'fs-extra';
import {join} from 'path';
import {i18n} from './locales';

/**
 * Returns the full path of the user's story directory.
 */
export function storyDirectoryPath() {
	return join(
		app.getPath('documents'),
		i18n.t('common.appName'),
		i18n.t('electron.storiesDirectoryName')
	);
}

/**
 * Creates the stories directory, if it doesn't already exist. If it does exist,
 * this does nothing. In either case, it returns a promise that resolves once
 * done.
 */
export async function createStoryDirectory() {
	return await mkdirp(storyDirectoryPath());
}

/**
 * Shows the story directory in the user's file browser.
 */
export async function revealStoryDirectory() {
	return await shell.openPath(storyDirectoryPath());
}

/**
 * Creates a backup of the entire story directory.
 */
export async function backupStoryDirectory(maxBackups = 10) {
	console.log('Backing up story library');

	const backupPath = join(
		app.getPath('documents'),
		i18n.t('common.appName'),
		i18n.t('electron.backupsDirectoryName')
	);
	const now = new Date();
	const backupDirectoryName = join(
		backupPath,
		`${now.getFullYear()}-${
			now.getMonth() + 1
		}-${now.getDate()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}-${now.getMilliseconds()}`
	);

	await copy(storyDirectoryPath(), backupDirectoryName);
	console.log(`Backed up story library to ${backupDirectoryName}`);

	const backupDirs = (await readdir(backupPath, {withFileTypes: true})).filter(
		file => file.isDirectory() && file.name[0] !== '.'
	);

	if (backupDirs.length > maxBackups) {
		console.log(
			`There are ${backupDirs.length} story library backups; pruning`
		);

		const backups = await Promise.all(
			backupDirs.map(async directory => {
				const stats = await stat(join(backupPath, directory.name));

				return {stats, name: directory.name};
			})
		);

		backups.sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);

		const toDelete = backups.slice(0, backups.length - maxBackups);

		await Promise.allSettled(
			toDelete.map(file => {
				const directoryName = join(backupPath, file.name);

				console.log(`Deleting ${directoryName}`);
				return remove(directoryName);
			})
		);
	}
}
