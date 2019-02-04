/*
This function acts as a bridge between web and Electron contexts. In Electron,
it is important that each story on disk have the same ID; however, in the web
context, where everything is persisted to local storage instead, we simply need
a unique ID. This function returns a deterministic ID in an Electron context,
and a random ID in a web context.
*/

const uuid = require('tiny-uuid');
const isElectron = require('../electron/is-electron');

module.exports = function idFor(key) {
	if (isElectron()) {
		return window.encodeURIComponent(key);
	}

	return uuid();
};
