/*
This function acts as a bridge between web and Electron contexts. In Electron,
it is important that each story on disk have the same ID; however, in the web
context, where everything is persisted to local storage instead, we simply need
a unique ID. This function returns a deterministic ID in an Electron context,
and a random ID in a web context.

Consumers of this module should not depend on the exact ID, or the format of IDs
returned -- this may change in future revisions.
*/

const uuid = require('tiny-uuid');
const isElectron = require('../electron/is-electron');

module.exports = function idFor(key) {
	if (isElectron()) {
		/*
		This uses Java's hashCode method. We need to coerce it to a string to
		avoid the number being garbled by addition operations elsewhere.
		https://stackoverflow.com/a/34842797
		*/

		return key
			.split('')
			.reduce(
				(prevHash, currVal) =>
					((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
				0
			)
			.toString();
	}

	return uuid();
};
