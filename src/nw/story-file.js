// Manages interactions with individual story files.

const storyFile = module.exports = {
	// A global flag that allows deactivation of the module. This is needed
	// while the module itself works, so that changes in local storage made
	// here don't trigger a save to the filesystem, which in turn would trigger
	// a change to local storage, etc.

	active: true,

	// Returns a filename for a story model that's guaranteed to be safe across
	// all platforms. For this, we use POSIX's definition
	// (http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
	// with the addition of spaces, for legibility.

	fileName(story) {
		return story.get('name').replace(/[^\w\. -]/g, '_') + '.html';
	},

	// Saves a story model to the file system.

	save(story) {
		const fs = require('fs');
		const directories = require('./directories');
		const path = require('path');

		try {
			directories.unlockStories();
			const fd = fs.openSync(
				path.join(directories.storiesPath(), storyFile.fileName(story)),
				'w'
			);

			fs.writeSync(fd, story.publish(null, null, true));
			fs.closeSync(fd);
		}
		finally {
			directories.lockStories();
		}
	},

	// Deletes a story file from the file system.

	delete(story) {
		const fs = require('fs');
		const directories = require('./directories');
		const path = require('path');

		try {
			directories.unlockStories();
			fs.unlinkSync(
				path.join(directories.storyPath(), storyFile.fileName(story))
			);
		}
		finally {
			directories.lockStories();
		}
	},

	// Syncs local storage with the file system, obliterating any stories that
	// happen to be saved to local storage only.

	loadAll() {
		//FIXME
		//const StoryCollection = require('../data/collections/story');
		const directories = require('./directories');
		const fs = require('fs');
		const fileImport = require('../file/import');
		const path = require('path');

		storyFile.active = false;

		try {
			// Clear all existing stories.

			const allStories = StoryCollection.all();

			while (allStories.length > 0) {
				allStories.at(0).destroy();
			}

			// Iterate over all files in the stories directory.

			directories.lockStories();

			const storyPath = directories.storiesPath();
			const fileStories = fs.readdirSync(storyPath);

			// obtain the full contents of every file, sync

			fileStories.map(filename => {
				if (filename.match(/\.html$/)) {
					const filePath = path.join(storyPath, filename);
					const stats = fs.statSync(filePath);

					return {
						file: fs.readFileSync(filePath, { encoding: 'utf-8' }),
						stats
					};
				}
			})

			// remove undefineds from the array

			.filter(Boolean)

			// import the files. It doesn't matter if this is async,
			// because all of the filesystem I/O is finished.

			.reduce(
				(promise, {file, stats}) => promise.then(()=>
				fileImport.importData(file, {
					lastUpdate: new Date(Date.parse(stats.mtime)),
					confirmReplace: false,
					silent: true
				})),
				Promise.resolve()
			);
		}
		finally {
			directories.unlockStories();
			storyFile.active = true;
		}
	}
};
