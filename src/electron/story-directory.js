const {app, shell} = require('electron');
const fs = require('fs');
const locale = require('../locale');
const mkdirp = require('mkdirp-promise');
const path = require('path');
const util = require('util');

const StoryDirectory = (module.exports = {
	/*
	Returns the full path of the user's story directory.
	*/

	path() {
		return path.join(
			app.getPath('documents'),
			locale.say('Twine'),
			locale.say('Stories')
		);
	},

	/*
	Creates the stories directory, if it doesn't already exist. If it does
	exist, this does nothing. In either case, it returns a promise that resolves
	once done.
	*/

	create() {
		return mkdirp(StoryDirectory.path());
	},

	/*
	Locks the story directory, preventing user tampering (and confusing the
	app). This returns a promise that resolves when done.
	*/

	lock() {
		const readdir = util.promisify(fs.readdir);
		const chmod = util.promisify(fs.chmod);
		const stat = util.promisify(fs.stat);

		const storyPath = StoryDirectory.path();

		if (process.platform == 'win32') {
			/* On Windows, we must lock each file individually. */

			return readdir(storyPath).then(files => {
				return Promise.all(
					/* a-w, 0444 */
					files.map(f => chmod(path.join(storyPath, f), 292))
				);
			});
		} else {
			/* Everywhere else, locking the directory is good enough. */

			return stat(storyPath).then(stats =>
				/* u-w */
				chmod(storyPath, stats.mode ^ 128)
			);
		}
	},

	/*
	Unlocks the story directory. This returns a promise that resolves when done.
	*/

	unlock() {
		const readdir = util.promisify(fs.readdir);
		const chmod = util.promisify(fs.chmod);
		const stat = util.promisify(fs.stat);

		const storyPath = StoryDirectory.path();

		if (process.platform == 'win32') {
			/* On Windows, we must lock each file individually. */

			return readdir(storyPath).then(files => {
				return Promise.all(
					/* a+w, 0666 */
					files.map(f => chmod(path.join(storyPath, f), 438))
				);
			});
		} else {
			/* Everywhere else, locking the directory is good enough. */

			return stat(storyPath).then(stats =>
				/* u-w */
				chmod(storyPath, stats.mode | 128)
			);
		}
	},

	/*
	Shows the story directory in the user's file browser.
	*/

	reveal() {
		shell.openItem(StoryDirectory.path());
	}
});
