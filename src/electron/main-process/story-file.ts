import {app, dialog, shell} from 'electron';
import {
	mkdtemp,
	move,
	readdir,
	readFile,
	rename,
	stat,
	writeFile
} from 'fs-extra';
import {basename, join} from 'path';
import {i18n} from './locales';
import {getStoryDirectoryPath} from './story-directory';
import {Story} from '../../store/stories/stories.types';
import {storyFileName} from '../shared/story-filename';
import {
	stopTrackingFile,
	fileWasTouched,
	wasFileChangedExternally
} from './track-file-changes';

export interface StoryFile {
	htmlSource: string;
	mtime: Date;
}

/**
 * Returns a promise resolving to an array of HTML strings to load from the
 * story directory. Each string corresponds to an individual story.
 */
export async function loadStories() {
	const storyPath = getStoryDirectoryPath();
	const result: StoryFile[] = [];
	const files = await readdir(storyPath);

	await Promise.all(
		files
			.filter(f => /\.html$/i.test(f))
			.map(async f => {
				const filePath = join(storyPath, f);
				const stats = await stat(filePath);

				if (!stats.isDirectory()) {
					result.push({
						mtime: stats.mtime,
						htmlSource: await readFile(filePath, 'utf8')
					});
					return fileWasTouched(filePath);
				}
			})
	);

	return result;
}

/**
 * Saves story HTML to the file system. This returns a promise that resolves
 * when complete.
 */
export async function saveStoryHtml(story: Story, storyHtml: string) {
	// We save to a temp file first, then overwrite the existing if that succeeds,
	// so that if any step fails, the original file is left intact.

	const savedFilePath = join(getStoryDirectoryPath(), storyFileName(story));

	console.log(`Saving ${savedFilePath}`);

	try {
		const tempFileDirectory = await mkdtemp(
			join(app.getPath('temp'), `twine-${story.id}`)
		);
		const tempFilePath = join(tempFileDirectory, storyFileName(story));

		if (await wasFileChangedExternally(savedFilePath)) {
			const {response} = await dialog.showMessageBox({
				buttons: [
					i18n.t('electron.errors.storyFileChangedExternally.overwriteChoice'),
					i18n.t('electron.errors.storyFileChangedExternally.relaunchChoice')
				],
				detail: i18n.t('electron.errors.storyFileChangedExternally.detail'),
				message: i18n.t('electron.errors.storyFileChangedExternally.message', {
					fileName: basename(savedFilePath)
				}),
				type: 'warning'
			});

			if (response === 1) {
				app.relaunch();
				app.quit();
				return;
			}
		}

		await writeFile(tempFilePath, storyHtml, 'utf8');
		await move(tempFilePath, savedFilePath, {
			overwrite: true
		});
		await fileWasTouched(savedFilePath);
		console.log(`Successfully saved ${savedFilePath}`);
	} catch (e) {
		console.error(`Error while saving ${savedFilePath}: ${e}`);
		throw e;
	}
}

/**
 * Deletes a story by moving it to the trash. This returns a promise that resolves
 * when finished.
 */
export async function deleteStory(story: Story) {
	try {
		const deletedFilePath = join(getStoryDirectoryPath(), storyFileName(story));

		console.log(`Trashing ${deletedFilePath}`);
		await shell.trashItem(deletedFilePath);
		stopTrackingFile(deletedFilePath);
		console.log(`Successfully trashed ${deletedFilePath}`);
	} catch (e) {
		console.warn(`Error while deleting story: ${e}`);
		throw e;
	}
}

/**
 * Renames a story in the file system. This returns a promise that resolves when
 * finished.
 */
export async function renameStory(oldStory: Story, newStory: Story) {
	try {
		const storyPath = getStoryDirectoryPath();
		const newStoryPath = join(storyPath, storyFileName(newStory));
		const oldStoryPath = join(storyPath, storyFileName(oldStory));

		console.log(`Renaming ${oldStoryPath} to ${newStoryPath}`);
		await rename(oldStoryPath, newStoryPath);
		stopTrackingFile(oldStoryPath);
		await fileWasTouched(newStoryPath);
		console.log(`Successfully renamed ${oldStoryPath} to ${newStoryPath}`);
	} catch (e) {
		console.warn(`Error while renaming story: ${e}`);
		throw e;
	}
}
