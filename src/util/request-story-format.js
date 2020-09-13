/*
Manages requesting a story format via URL. There are two aspects that add
complexity:

- The difference between web and Electron contexts. In a web context, the app is
  able to make JSON requests freely. In Electron contexts, however, it is
  restricted to HTTP/HTTPS only. To allow users to add story formats via
  file:/// URL, the main process will make JSONP requests on behalf of a web
  process.

  This is only needed for requests outside the app bundle (e.g. loading a locale
  or an external story format).

- Throttling requests. Because all story formats load via the same global
  callback, we can only load one at a time safely--otherwise they will compete
  for the same callback.
*/

import jsonp from 'jsonp';
import isElectron from './is-electron';

let requestQueue = Promise.resolve();

export default async function requestStoryFormat(url, timeout = 2000) {
	const jsonpRequester = isElectron() ? window.twineElectron.jsonp : jsonp;

	return new Promise(
		(resolve, reject) =>
			(requestQueue = requestQueue.then(
				() =>
					new Promise(resolveQueue => {
						jsonpRequester(url, {timeout, name: 'storyFormat'}, (err, data) => {
							if (err) {
								reject(err);
							} else {
								resolve(data);
							}

							resolveQueue();
						});
					})
			))
	);
}
