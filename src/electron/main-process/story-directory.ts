import {app, dialog, shell} from 'electron';
import {copy, mkdirp, readdir, remove, stat} from 'fs-extra';
import {join} from 'path';
import {i18n} from './locales';
import {getAppPref, setAppPref} from './app-prefs';
import {showRelaunchDialog} from './relaunch-dialog';

// We can't initialize this because the i18n module needs to set itself up
// first.

let storyDirectoryPath: string;

/**
 * Initializes the user story directory, deciding whether to use one set by app
 * preference or fall back to the default (if the the app pref is unset, or the
 * directory in the app pref can't be read).
 *
 * If the app pref directory is unavailable, the user will be shown a warning
 * dialog that allows either continuing with the default or quitting the app.
 * If the user continues, their preference will be reset.
 *
 * This must be called before any other functions in this module.
 */
export async function initStoryDirectory() {
	const prefPath = getAppPref('storyLibraryFolderPath');

	if (typeof prefPath === 'string') {
		// Try reading it initially. We need to use readdir() instead of access()
		// because access() just tells us if we can see the directory itself, not
		// anything inside it.

		try {
			await readdir(prefPath);
			storyDirectoryPath = prefPath;
			console.log(`Story library path initialized as ${storyDirectoryPath}`);
			return;
		} catch (error) {
			// Maybe it doesn't exist yet. Try creating it.

			try {
				await mkdirp(prefPath);
				await readdir(prefPath);
				storyDirectoryPath = prefPath;
				return;
			} catch (error) {
				// OK, we give up.

				const {response} = await dialog.showMessageBox({
					detail: i18n.t('electron.errors.storyLibraryFolderAppPref.detail', {
						path: prefPath
					}),
					message: i18n.t('electron.errors.storyLibraryFolderAppPref.message'),
					type: 'error',
					buttons: [
						i18n.t('electron.errors.storyLibraryFolderAppPref.useDefault'),
						i18n.t('electron.errors.storyLibraryFolderAppPref.quit')
					],
					defaultId: 0
				});

				if (response === 1) {
					app.quit();
				}

				// Reset the preference and fall through to the default path.

				setAppPref('storyLibraryFolderPath', undefined);
			}
		}
	}

	storyDirectoryPath = join(
		app.getPath('documents'),
		i18n.t('common.appName'),
		i18n.t('electron.storiesDirectoryName')
	);
	console.log(`Story library path initialized as ${storyDirectoryPath}`);
}

/**
 * Returns the full path of the user's story directory.
 */
export function getStoryDirectoryPath() {
	if (storyDirectoryPath === undefined) {
		throw new Error(
			'getStoryDirectoryPath() must be called after initStoryDirectory()'
		);
	}

	return storyDirectoryPath;
}

/**
 * Asks the user to choose a story directory folder and updates the app pref as needed.
 */
export async function chooseStoryDirectoryPath() {
	const {canceled, filePaths} = await dialog.showOpenDialog({
		defaultPath: getStoryDirectoryPath(),
		properties: ['createDirectory', 'openDirectory'],
		title: 'Choose a folder'
	});

	if (!canceled) {
		setAppPref('storyLibraryFolderPath', filePaths[0]);
		await showRelaunchDialog();
	}
}

/**
 * Creates the stories directory, if it doesn't already exist. If it does exist,
 * this does nothing. In either case, it returns a promise that resolves once
 * done.
 */
export async function createStoryDirectory() {
	return await mkdirp(getStoryDirectoryPath());
}

/**
 * Shows the story directory in the user's file browser.
 */
export async function revealStoryDirectory() {
	return await shell.openPath(getStoryDirectoryPath());
}

/**
 * Creates a backup of the entire story directory.
 */
export async function backupStoryDirectory(maxBackups = 10) {
	const prefPath = getAppPref('backupFolderPath');
	const backupPath =
		typeof prefPath === 'string'
			? prefPath
			: join(
					app.getPath('documents'),
					i18n.t('common.appName'),
					i18n.t('electron.backupsDirectoryName')
			  );

	console.log(`Backing up story library to ${backupPath}`);
	
	const now = new Date();
	const backupDirectoryName = join(
		backupPath,
		`${now.getFullYear()}-${
			now.getMonth() + 1
		}-${now.getDate()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}-${now.getMilliseconds()}`
	);

	await copy(getStoryDirectoryPath(), backupDirectoryName);
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
