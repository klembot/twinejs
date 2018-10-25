/*
Manages reading and writing files from the story directory.
*/

const fs = require('fs');
const path = require('path');
const util = require('util');
const {path: storyDirectoryPath} = require('./story-directory');

module.exports = {
	/*
	Returns a promise resolving to an array of HTML strings to load from the
	story directory. Each string corresponds to an individual story. 
	*/

	load() {
		const storyPath = storyDirectoryPath();
		const result = [];
		const readdir = util.promisify(fs.readdir);
		const readFile = util.promisify(fs.readFile);

		return readdir(storyPath)
			.then(files => {
				return Promise.all(
					files.filter(f => /\.html?/i.test(f)).map(f =>
						readFile(path.join(storyPath, f), {
							encoding: 'utf8'
						}).then(data => result.push(data))
					)
				);
			})
			.then(() => result);
	}
};
