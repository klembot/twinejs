/*
Persists data to the file system. This can only be used when running in an
Electron context (see src/electron/is-electron.js for how to detect that).
*/

const {remote} = require('electron');
const {importStory} = require('../actions/story');
const importFile = require('../import');

module.exports = store => {
	remote.getGlobal('initialStoryData').forEach(story => {
		const storyData = importFile(story.data, story.mtime);

		if (storyData.length > 0) {
			importStory(store, storyData[0]);
		}
	});
};
