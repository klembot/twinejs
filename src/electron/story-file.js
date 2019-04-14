/*
Manages reading and writing files from the story directory. This listens to the
`save-story` and `delete-story` IPC events.
*/

const fs = require('fs');
const {dialog, ipcMain} = require('electron');
const path = require('path');
const util = require('util');
const {
	lock: lockStoryDirectory,
	path: storyDirectoryPath,
	unlock: unlockStoryDirectory
} = require('./story-directory');
const {say} = require('../locale');
const {publishStory, publishStoryWithFormat} = require('../data/publish');

const StoryFile = (module.exports = {
	/*
	Returns a promise resolving to an array of HTML strings to load from the
	story directory. Each string corresponds to an individual story. 
	*/

	load() {
		const storyPath = storyDirectoryPath();
		const result = [];
		const readdir = util.promisify(fs.readdir);
		const readFile = util.promisify(fs.readFile);
		const stat = util.promisify(fs.stat);

		return readdir(storyPath)
			.then(files => {
				return Promise.all(
					files
						.filter(f => /\.html$/i.test(f))
						.map(f => {
							const filePath = path.join(storyPath, f);
							const loadedFile = {};

							return stat(filePath)
								.then(fileStats => {
									loadedFile.mtime = fileStats.mtime;

									return readFile(filePath, {
										encoding: 'utf8'
									});
								})
								.then(fileData => {
									loadedFile.data = fileData;
									result.push(loadedFile);
								});
						})
				);
			})
			.then(() => result);
	},

	/*
	Returns a filename for a story object that's guaranteed to be safe across
	all platforms. For this, we use POSIX's definition
	(http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
	with the addition of spaces, for legibility.
	*/

	fileName(storyName) {
		return storyName.replace(/[^\w\. -]/g, '_') + '.html';
	},

	/*
	Saves a story to the file system. Unlike previous incarnations, this saves a
	published version of the story (e.g. playable in a browser) to avoid user
	confusion. The format should already be loaded when this is called. If for
	any reason the full publish fails, this instead publishes the story naked,
	as story data only. This returns a promise that resolves when complete.
	*/

	save(story, format, appInfo) {
		const open = util.promisify(fs.open);
		const write = util.promisify(fs.write);

		/*
		Try to save a full publish; if that fails, do a naked publish.
		*/

		let output;

		return new Promise((resolve, reject) => {
			try {
				output = publishStoryWithFormat(appInfo, story, format);
			} catch (e) {
				console.warn(
					`Failed to fully publish story (${
						e.message
					}). Attempting naked publish.`
				);

				try {
					output = publishStory(appInfo, story, null, null, true);
				} catch (e) {
					reject(e);
					return;
				}
			}
			resolve();
		})
			.then(unlockStoryDirectory)
			.then(() =>
				open(
					path.join(
						storyDirectoryPath(),
						StoryFile.fileName(story.name)
					),
					'w'
				)
			)
			.then(fd => write(fd, output))
			.then(lockStoryDirectory);
	},

	/*
	Deletes a story from the file system. This returns a promise that resolves
	when finished.
	*/

	delete(story) {
		const unlink = util.promisify(fs.unlink);

		return unlockStoryDirectory()
			.then(() =>
				unlink(
					path.join(
						storyDirectoryPath(),
						StoryFile.fileName(story.name)
					)
				)
			)
			.then(lockStoryDirectory);
	},

	/*
	Renames a story in the file system. This returns a promise that resolves
	when finished.
	*/

	rename(oldStory, newStory) {
		const rename = util.promisify(fs.rename);

		return rename(
			path.join(storyDirectoryPath(), StoryFile.fileName(oldStory.name)),
			path.join(storyDirectoryPath(), StoryFile.fileName(newStory.name))
		);
	}
});

/*
We need to ensure that all file operations happen serially, because they
individually unlock and lock the story directory. Because file operations are
all asynchronous, we have to enforce this by hand.
*/

let storyTask = Promise.resolve();

function queueStoryTask(func) {
	storyTask = storyTask.then(func, func);
}

ipcMain.on('save-story', (e, story, format, appInfo) =>
	queueStoryTask(() =>
		StoryFile.save(story, format, appInfo)
			.then(() => e.sender.send('story-saved', story, format, appInfo))
			.catch(e =>
				dialog.showErrorBox(
					say('An error occurred while saving a story.'),
					e.message
				)
			)
	)
);

ipcMain.on('delete-story', (e, story) =>
	queueStoryTask(() =>
		StoryFile.delete(story)
			.then(() => e.sender.send('story-deleted', story))
			.catch(e =>
				dialog.showErrorBox(
					say('An error occurred while deleting a story.'),
					e.message
				)
			)
	)
);

ipcMain.on('rename-story', (e, oldStory, newStory) =>
	queueStoryTask(() =>
		StoryFile.rename(oldStory, newStory)
			.then(() => e.sender.send('story-renamed', oldStory, newStory))
			.catch(e =>
				dialog.showErrorBox(
					say('An error occurred while renaming a story.'),
					e.message
				)
			)
	)
);
