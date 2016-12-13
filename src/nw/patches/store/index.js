const FilePersistence = require('./file-persistence');

module.exports = Store => {
	Store._middlewares.push(FilePersistence);
	window.vuexStore = Store;
};
