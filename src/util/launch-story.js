/*
Manages launching a story in either test or play mode. In a web context, this
just opens a new tab with the appropriate app route. In Electron, it sends an
IPC message to save to a temp file, then open it (see
src/electron/open-with-temp-file.js).
*/

import isElectron from './is-electron';
import {publishStory} from '@/store/publish';

export async function launchStory(
	store,
	storyId,
	{proof, startPassage, test} = {}
) {
	if (isElectron()) {
		const html = await publishStory(store, storyId, {
			proof,
			startPassage,
			test
		});

		window.twineElectron.ipcRenderer.send('open-with-temp-file', html, '.html');
	} else {
		if (proof) {
			window.open(`/stories/${storyId}/proof`, '_blank');
		} else if (test) {
			if (startPassage) {
				window.open(`/stories/${storyId}/test/${startPassage}`, '_blank');
			} else {
				window.open(`/stories/${storyId}/test`, '_blank');
			}
		} else {
			window.open(`/stories/${storyId}/play`, '_blank');
		}
	}
}

export default launchStory;
