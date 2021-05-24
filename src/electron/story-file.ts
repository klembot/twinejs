import {app, shell} from 'electron';
import fs from 'fs-extra';
import path from 'path';
import {
	lockStoryDirectory,
	storyDirectoryPath,
	unlockStoryDirectory
} from './story-directory';
import {AppInfo} from '../util/app-info';
import {Story} from '../store/stories/stories.types';
import {StoryFormat} from '../store/story-formats/story-formats.types';
import {publishStory, publishStoryWithFormat} from '../util/publish';

export interface StoryFile {
	htmlSource: string;
	mtime: Date;
}

/**
 * Returns a promise resolving to an array of HTML strings to load from the
 * story directory. Each string corresponds to an individual story.
 */
export async function loadStories() {
	const storyPath = storyDirectoryPath();
	const result: StoryFile[] = [];
	const files = await fs.readdir(storyPath);

	await Promise.all(
		files
			.filter(f => /\.html$/i.test(f))
			.map(async f => {
				const filePath = path.join(storyPath, f);

				result.push({
					mtime: (await fs.stat(filePath)).mtime,
					htmlSource: await fs.readFile(filePath, 'utf8')
				});
			})
	);

	return result;
}

/**
 * Returns a filename for a story object that's guaranteed to be safe across all
 * platforms. For this, we use POSIX's definition
 * (http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
 * with the addition of spaces, for legibility.
 */
export function storyFileName(storyName: string) {
	return storyName.replace(/[^\w. -]/g, '_') + '.html';
}

/**
 * Saves a story to the file system. Unlike previous incarnations, this saves a
 * published version of the story (e.g. playable in a browser) to avoid user
 * confusion. The format should already be loaded when this is called. If for
 * any reason the full publish fails, this instead publishes the story naked, as
 * story data only. This returns a promise that resolves when complete.
 */
export async function saveStory(
	story: Story,
	format: StoryFormat,
	appInfo: AppInfo
) {
	// We save to a temp file first, then overwrite the existing if that succeeds,
	// so that if any step fails, the original file is left intact.

	const savedFilePath = path.join(
		storyDirectoryPath(),
		storyFileName(story.name)
	);
	const tempFilePath = path.join(
		app.getPath('temp'),
		storyFileName(story.name)
	);

	let output;

	// Try to save a full publish; if that fails, do a naked publish.

	try {
		if (!format) {
			throw new Error('No story format was provided to save.');
		}

		if (format.loadState !== 'loaded') {
			throw new Error('This story format was not loaded.');
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

/**
 * Deletes a story by moving it to the trash. This returns a promise that resolves
 * when finished.
 */
export async function deleteStory(story: Story) {
	try {
		await unlockStoryDirectory();
		shell.trashItem(path.join(storyDirectoryPath(), storyFileName(story.name)));
		await lockStoryDirectory();
	} catch (e) {
		console.warn(`Error while deleting story: ${e}`);
		await lockStoryDirectory();
		throw e;
	}
}

/**
 * Renames a story in the file system. This returns a promise that resolves when
 * finished.
 */
export async function renameStory(oldStory: Story, newStory: Story) {
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
