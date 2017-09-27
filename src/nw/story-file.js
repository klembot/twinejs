/*
Manages interactions with individual story files.
*/

const StoryFile = module.exports = {
	/*
	A global flag that allows deactivation of the module. This is needed while
	the module itself works, so that changes in local storage made here don't
	trigger a save to the filesystem, which in turn would trigger a change to
	local storage, etc.
	*/

	active: true,

	/*
	Returns a filename for a story object that's guaranteed to be safe across
	all platforms. For this, we use POSIX's definition
	(http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
	with the addition of spaces, for legibility.
	*/

	fileName(story) {
		return story.name.replace(/[^\w\. -]/g, '_') + '.html';
	},

	/*
	Saves a story object to the file system.
	*/

	save(story, appInfo) {
		if (!StoryFile.active) {
			return;
		}

		const fs = require('fs');
		const directories = require('./directories');
		const path = require('path');
		const { publishStory } = require('../data/publish');

		try {
			directories.unlockStories();
			const fd = fs.openSync(
				path.join(directories.storiesPath(), StoryFile.fileName(story)),
				'w'
			);

			fs.writeSync(fd, publishStory(appInfo, story, null, null, true));
			fs.closeSync(fd);
		}
		finally {
			directories.lockStories();
		}
	},

	/*
	Deletes a story file from the file system.
	*/

	delete(story) {
		if (!StoryFile.active) {
			return;
		}

		const fs = require('fs');
		const directories = require('./directories');
		const path = require('path');

		try {
			directories.unlockStories();
			fs.unlinkSync(
				path.join(directories.storiesPath(), StoryFile.fileName(story))
			);
		}
		finally {
			directories.lockStories();
		}
	},

	/*
	Syncs local storage with the file system, obliterating any stories that
	happen to be saved to local storage only. This is run at startup time, so
	efficiency is important.
	*/

	loadAll() {
		if (!StoryFile.active) {
			return;
		}

		const directories = require('./directories');
		const fs = require('fs');
		const path = require('path');
		const { deleteStory, importStory } = require('../data/actions/story');
		const importFile = require('../data/import');
		const store = require('../data/store');

		StoryFile.active = false;

		try {
			/*
			Delete all existing stories. We save the IDs in a separate step so
			that as we delete stories, the source list isn't affected.

			It's crucial that the active property be false before this happens
			to prevent files on disk from being deleted.
			*/

			const storyIds = store.state.story.stories.map(story => story.id);

			storyIds.forEach(id => deleteStory(store, id));

			/*
			Generate import actions for each .html file in the stories
			directory.
			*/

			directories.lockStories();

			const storyPath = directories.storiesPath();
			const fileStories = fs.readdirSync(storyPath);

			fileStories.map(filename => {
				if (filename.match(/\.html$/)) {
					const filePath = path.join(storyPath, filename);
					const source = fs.readFileSync(
						filePath,
						{ encoding: 'utf8' }
					);
					const stats = fs.statSync(filePath);
					const storyData = importFile(
						source,
						new Date(Date.parse(stats.mtime))
					);

					if (storyData.length > 0) {
						importStory(store, storyData[0]);
					}
				}
			});
		}
		finally {
			directories.unlockStories();
			StoryFile.active = true;
		}
	}
};
