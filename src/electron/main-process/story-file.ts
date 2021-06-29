import {app, shell} from 'electron';
import fs from 'fs-extra';
import path from 'path';
import {
	lockStoryDirectory,
	storyDirectoryPath,
	unlockStoryDirectory
} from './story-directory';
import {Story} from '../../store/stories/stories.types';
import {storyFileName} from '../shared/story-filename';

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
 * Saves story HTML to the file system. This returns a promise that resolves
 * when complete.
 */
export async function saveStoryHtml(story: Story, storyHtml: string) {
	// We save to a temp file first, then overwrite the existing if that succeeds,
	// so that if any step fails, the original file is left intact.

	const savedFilePath = path.join(storyDirectoryPath(), storyFileName(story));
	const tempFilePath = path.join(app.getPath('temp'), storyFileName(story));

	try {
		await fs.writeFile(tempFilePath, storyHtml, 'utf8');
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
		shell.trashItem(path.join(storyDirectoryPath(), storyFileName(story)));
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
			path.join(storyDirectoryPath(), storyFileName(oldStory)),
			path.join(storyDirectoryPath(), storyFileName(newStory))
		);
		await lockStoryDirectory();
	} catch (e) {
		console.warn(`Error while renaming story: ${e}`);
		await lockStoryDirectory();
		throw e;
	}
}
