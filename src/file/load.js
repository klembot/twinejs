// Handles reading in data from a file in a FileList, e.g. from an upload
// element.
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
//
// This returns a promise that resolves with the data in the file.

module.exports = file => {
	const reader = new FileReader();

	return new Promise(resolve => {
		reader.addEventListener('load', e => {
			resolve(e.target.result);
		});

		reader.readAsText(file, 'UTF-8');
	});
};
