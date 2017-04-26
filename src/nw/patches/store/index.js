const FilePersistence = require('./file-persistence');

module.exports = Store => {
	FilePersistence(Store);
	window.vuexStore = Store; /* for debugging */
};
