const filePersistence = require('./file-persistence');

module.exports = (Store) => {
	Store._middlewares.push(filePersistence);
	window.vuexStore = Store;
};
