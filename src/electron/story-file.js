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
		const stat = util.promisify(fs.stat);

		return readdir(storyPath)
			.then(files => {
				return Promise.all(
					files.filter(f => /\.html?/i.test(f)).map(f => {
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
	}
};
