/*
This function acts as a bridge between web and Electron contexts. In a web
context, the app is able to make JSON requests freely. In Electron contexts,
however, it is restricted to HTTP/HTTPS only. To allow users to add story
formats via file:/// URL, the main process will make JSONP requests on behalf of
a web process.

This is only needed for requests outside the app bundle (e.g. loading a locale).
*/

const jsonp = require('jsonp');
const isElectron = require('../electron/is-electron');

module.exports = function jsonpRequest(url, props, callback) {
	if (isElectron()) {
		return window.twineElectron.jsonp(url, props, callback);
	}

	return jsonp(url, props, callback);
};
