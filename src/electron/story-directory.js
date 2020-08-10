import {app, shell} from 'electron';
import fs from 'fs-extra';
import klaw from 'klaw-sync';
import mkdirp from 'mkdirp-promise';
import nodePath from 'path';
import {t} from '../util/i18n';

/*
Returns the full path of the user's story directory.
*/

export function storyDirectoryPath() {
	return nodePath.join(
		app.getPath('documents'),
		t('common.appName'),
		t('electron.storiesDirectoryName')
	);
}

/*
Creates the stories directory, if it doesn't already exist. If it does
exist, this does nothing. In either case, it returns a promise that resolves
once done.
*/

export async function createStoryDirectory() {
	await mkdirp(storyDirectoryPath());
}

/*
Locks the story directory, preventing user tampering (and confusing the
app).
*/

export async function lockStoryDirectory() {
	const storyPath = storyDirectoryPath();

	if (process.platform == 'win32') {
		/* On Windows, we must lock each file individually. */

		const files = await fs.readdir(storyPath);

		/* a-w, 0444 */
		return Promise.allSettled(
			files.map(f => fs.chmod(storyDirectoryPath.join(storyPath, f), 292))
		);
	}

	/* Everywhere else, locking the directory is good enough. */

	const stats = await fs.stat(storyPath);

	/* u-w */
	await fs.chmod(storyPath, stats.mode ^ 128);
}

/*
Unlocks the story directory. This returns a promise that resolves when done.
*/

export async function unlockStoryDirectory() {
	const storyPath = storyDirectoryPath();

	if (process.platform == 'win32') {
		/* On Windows, we must unlock each file individually. */

		const files = await fs.readdir(storyPath);

		/* a+w, 0444 */
		return Promise.allSettled(
			files.map(f => fs.chmod(storyDirectoryPath.join(storyPath, f), 438))
		);
	}

	/* Everywhere else, locking the directory is good enough. */

	const stats = await fs.stat(storyPath);

	/* u-w */
	await fs.chmod(storyPath, stats.mode | 128);
}

/*
Shows the story directory in the user's file browser.
*/

export async function revealStoryDirectory() {
	try {
		shell.openPath(storyDirectoryPath());
	} catch (e) {
		console.warn(`failed to open ${storyDirectoryPath()}: ${e}`);
		throw e;
	}
}

/*
Creates a backup of the entire story directory.
*/

export async function backupStoryDirectory(maxBackups = 10) {
	console.log('Backing up story library');

	const backupPath = storyDirectoryPath.join(
		app.getPath('documents'),
		t('common.appName'),
		t('electron.backupsDirectoryName')
	);
	const now = new Date();

	await fs.copy(
		storyDirectoryPath(),
		nodePath.join(
			backupPath,
			`${now.getFullYear()}-${now.getMonth() +
				1}-${now.getDate()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}-${now.getMilliseconds()}`
		)
	);

	const backups = klaw(backupPath, {
		depthLimit: 0,
		filter(file) {
			return storyDirectoryPath.basename(file.path)[0] !== '.';
		},
		nofile: true
	}).sort((a, b) => {
		if (a.stats.mTimeMs < b.stats.mTimeMs) {
			return -1;
		}

		if (a.stats.mTimeMs > b.stats.mTimeMs) {
			return 1;
		}

		return 0;
	});

	if (backups.length > maxBackups) {
		console.log(`There are ${backups.length} story library backups, pruning`);

		const toDelete = backups.slice(0, backups.length - maxBackups);

		await Promise.allSettled(toDelete.map(file => fs.remove(file.path)));
	}
}
