/*
This function acts as a bridge between web and Electron contexts. In a web
context, the app is able to make JSON requests freely. In Electron contexts,
however, it is restricted to HTTP/HTTPS only. To allow users to add story
formats via file:/// URL, the main process will make JSONP requests on behalf of
a web process.

This forces all callbacks using the same name to load sequentially, to avoid
race conditions.

This is only needed for requests outside the app bundle (e.g. loading a locale).
*/

const jsonp = require('jsonp');
const isElectron = require('../electron/is-electron');

const loadPromises = {};
const platformJsonp = isElectron() ? window.twineElectron.jsonp : jsonp;

module.exports = function jsonpRequest(url, props, callback) {
	if (props.name) {
		if (!loadPromises[props.name]) {
			loadPromises[props.name] = Promise.resolve();
		}

		loadPromises[props.name] = loadPromises[props.name].finally(
			() =>
				new Promise(resolve => {
					platformJsonp(url, props, (...args) => {
						callback(...args);
						resolve();
					});
				})
		);
	} else {
		return platformJsonp(url, props, callback);
	}
};
