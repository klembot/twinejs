/*
In a web context, opens or re-uses a browser window/tab to display a playable
version of a story. In Electron, this publishes the content, then sends it to be
viewed in a browser using a temp file.

These are a single entrypoint so that individual UI parts don't have to worry
about which context they're in to dispatch a play or test.
*/

import {
	getStoryPlayHtml,
	getStoryProofingHtml,
	getStoryTestHtml
} from './story-html';

import isElectron from '../electron/is-electron';
import {say} from '../locale';

const windows = {};

function openWindow(url) {
	if (windows[url]) {
		try {
			windows[url].focus();
			windows[url].location.reload();
			return;
		} catch (e) {
			/*
			Fall through: try opening the window as usual. The problem probably
			is that the window has since been closed by the user.
			*/
		}
	}

	windows[url] = window.open(url, url.replace(/\s/g, '_'));
}

export function playStory(store, storyId) {
	if (isElectron()) {
		getStoryPlayHtml(store, storyId)
			.then(html =>
				window.twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					html,
					'.html'
				)
			)
			.catch(e => {
				window.alert(
					say(
						'An error occurred while publishing your story. (%s)',
						e.message
					)
				);
			});
	} else {
		openWindow(`#stories/${storyId}/play`);
	}
}

export function proofStory(store, storyId) {
	if (isElectron()) {
		getStoryProofingHtml(store, storyId)
			.then(html =>
				window.twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					html,
					'.html'
				)
			)
			.catch(e => {
				window.alert(
					say(
						'An error occurred while publishing your story. (%s)',
						e.message
					)
				);
			});
	} else {
		openWindow(`#stories/${storyId}/proof`);
	}
}

export function testStory(store, storyId, startPassageId) {
	if (isElectron()) {
		getStoryTestHtml(store, storyId, startPassageId)
			.then(html =>
				window.twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					html,
					'.html'
				)
			)
			.catch(e => {
				window.alert(
					say(
						'An error occurred while publishing your story. (%s)',
						e.message
					)
				);
			});
	} else {
		if (startPassageId) {
			openWindow(`#stories/${storyId}/test/${startPassageId}`);
		} else {
			openWindow(`#stories/${storyId}/test`);
		}
	}
}
