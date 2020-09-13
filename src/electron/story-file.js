/*
Manages reading and writing files from the story directory. This listens to the
`save-story` and `delete-story` IPC events.
*/

import {app} from 'electron';
import fs from 'fs-extra';
import {dialog, ipcMain} from 'electron';
import path from 'path';
import {
	lockStoryDirectory,
	storyDirectoryPath,
	unlockStoryDirectory
} from './story-directory';
import {t} from '../util/i18n';
import {publishStory, publishStoryWithFormat} from '@/util/publish';

/*
Returns a promise resolving to an array of HTML strings to load from the
story directory. Each string corresponds to an individual story. 
*/

export async function loadStories() {
	const storyPath = storyDirectoryPath();
	const result = [];
	const files = await fs.readdir(storyPath);

	await Promise.all(
		files
			.filter(f => /\.html$/i.test(f))
			.map(async f => {
				const filePath = path.join(storyPath, f);
				const loadedFile = {};

				loadedFile.mtime = await fs.stat(filePath).mtime;
				loadedFile.data = await fs.readFile(filePath, 'utf8');
				result.push(loadedFile);
			})
	);

	return result;
}

/*
Returns a filename for a story object that's guaranteed to be safe across
all platforms. For this, we use POSIX's definition
(http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
with the addition of spaces, for legibility.
*/

export function storyFileName(storyName) {
	return storyName.replace(/[^\w. -]/g, '_') + '.html';
}

/*
Saves a story to the file system. Unlike previous incarnations, this saves a
published version of the story (e.g. playable in a browser) to avoid user
confusion. The format should already be loaded when this is called. If for
any reason the full publish fails, this instead publishes the story naked,
as story data only. This returns a promise that resolves when complete.
*/

export async function saveStory(story, format, appInfo) {
	/*
	We save to a temp file first, then overwrite the existing if that
	succeeds, so that if any step fails, the original file is left intact.
	*/

	const savedFilePath = path.join(
		storyDirectoryPath(),
		storyFileName(story.name)
	);
	const tempFilePath = path.join(
		app.getPath('temp'),
		storyFileName(story.name)
	);

	let output;

	/*
	Try to save a full publish; if that fails, do a naked publish.
	*/

	try {
		if (!format) {
			throw new Error('No story format was provided to save.');
		}

		output = publishStoryWithFormat(story, format.properties.source, appInfo);
	} catch (e) {
		console.warn(
			`Failed to fully publish story (${e.message}). Attempting naked publish.`
		);
		output = publishStory(story, appInfo, {startOptional: true});
	}

	try {
		await fs.writeFile(tempFilePath, output, 'utf8');
		await unlockStoryDirectory();
		await fs.move(tempFilePath, savedFilePath, {
			overwrite: true
		});
		await lockStoryDirectory();
	} catch (e) {
		console.warn(`Error while saving story: ${e}`);
		await lockStoryDirectory();
		throw e;
	}
}

/*
Deletes a story from the file system. This returns a promise that resolves
when finished.
*/

export async function deleteStory(story) {
	try {
		await unlockStoryDirectory();
		await fs.unlink(path.join(storyDirectoryPath(), storyFileName(story.name)));
		await lockStoryDirectory();
	} catch (e) {
		console.warn(`Error while deleting story: ${e}`);
		await lockStoryDirectory();
		throw e;
	}
}

/*
Renames a story in the file system. This returns a promise that resolves
when finished.
*/

export async function renameStory(oldStory, newStory) {
	try {
		await unlockStoryDirectory();
		await fs.rename(
			path.join(storyDirectoryPath(), storyFileName(oldStory.name)),
			path.join(storyDirectoryPath(), storyFileName(newStory.name))
		);
		await lockStoryDirectory();
	} catch (e) {
		console.warn(`Error while renaming story: ${e}`);
		await lockStoryDirectory();
		throw e;
	}
}

/*
We need to ensure that all file operations happen serially, because they
individually unlock and lock the story directory. Because file operations are
all asynchronous, we have to enforce this by hand.
*/

let storyTask = Promise.resolve();

function queueStoryTask(func) {
	storyTask = storyTask.then(func, func);
}

ipcMain.on('save-story', (event, story, format, appInfo) =>
	queueStoryTask(async () => {
		try {
			await saveStory(story, format, appInfo);
			event.sender.send('story-saved', story, format, appInfo);
		} catch (error) {
			dialog.showErrorBox(t('electron.errors.storySave'), error.message);
		}
	})
);

ipcMain.on('delete-story', (event, story) =>
	queueStoryTask(async () => {
		try {
			await deleteStory(story);
			event.sender.send('story-deleted', story);
		} catch (error) {
			dialog.showErrorBox(t('electron.errors.storyDelete'), error.message);
		}
	})
);

ipcMain.on('rename-story', (event, oldStory, newStory) =>
	queueStoryTask(async () => {
		try {
			await renameStory(oldStory, newStory);
			event.sender.send('story-renamed', oldStory, newStory);
		} catch (error) {
			dialog.showErrorBox(t('electron.errors.storyRename'), error.message);
		}
	})
);
