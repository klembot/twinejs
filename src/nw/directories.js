/*
Manages access to the user's Twine library directory.
*/

const osenv = require('osenv');
const locale = require('../locale');

const Directories = module.exports = {
	/*
	Returns the path to the user's documents directory. If one does not exist,
	this returns the empty string.
	*/

	docPath() {
		const fs = require('fs');
		const path = require('path');

		/*
		We require this here instead of at the top of the file so that on the
		web platform, it doesn't try to do any detection (and fail, because we
		are not shimming process).
		*/

		const homePath = osenv.home();

		/*
		If the user doesn't have a Documents folder, check for "My Documents"
		instead (thanks Windows).
		*/
	
		/*
		L10n: This is the folder name on OS X, Linux, and recent versions of
		Windows that a user's documents are stored in, relative to the user's
		home directory. If you need to use a space in this name, then it should
		have two backslashes (\\) in front of it.
		*/
		let docPath = path.join(homePath, locale.say('Documents'));

		if (fs.existsSync(docPath)) {
			return docPath;
		}

		/*
		L10n: This is the folder name on Windows XP that a user's
		documents are stored in, relative to the user's home
		directory. This is used if a folder with the name given
		by the translation key '/Documents' does not exist. If
		you need to use a space in this name, then it should have
		two backslashes (\\) in front of it.
		*/
		docPath = path.join(homePath, locale.say('My\\ Documents'));

		if (fs.existsSync(docPath)) {
			return docPath;
		}

		return '';
	},

	/*
	Returns the path to the user's Stories directory, in the Twine directory.
	*/

	storiesPath() {
		const path = require('path');

		return path.join(
			Directories.docPath(),
			locale.say('Twine'),
			locale.say('Stories')
		);
	},

	/*
	Locks the story directory to prevent the user from changing it
	outside of Twine.
	*/

	lockStories() {
		const fs = require('fs');
		const path = require('path');
		const storyPath = Directories.storiesPath();

		if (process.platform == 'win32') {
			/* On Windows, we must lock each file individually. */

			fs.readdirSync(storyPath).forEach(filename => {
				/* a-w, 0444 */
				fs.chmodSync(path.join(storyPath, filename), 292);
			});
		}
		else {
			/* Everywhere else, locking the directory is good enough. */

			/* u-w */
			fs.chmodSync(storyPath, fs.statSync(storyPath).mode ^ 128);
		}
	},

	/*
	Unlocks the story directory.
	*/

	unlockStories() {
		const fs = require('fs');
		const path = require('path');
		const storyPath = Directories.storiesPath();

		if (process.platform === 'win32') {
			/* On Windows, we must unlock each file individually. */

			fs.readdirSync(storyPath).forEach(filename => {
				/* a+w, 0666 */
				fs.chmodSync(path.join(storyPath, filename), 438);
			});
		}
		else {
			/* Everywhere else, unlocking the directory is good enough. */

			/* u-w */
			fs.chmodSync(storyPath, fs.statSync(storyPath).mode | 128);
		}
	}
};
