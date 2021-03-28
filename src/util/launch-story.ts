// Manages launching a story in either test, play, or proofing mode. In a web
// context, this just opens a new tab with the appropriate app route. In
// Electron, it sends an IPC message to save to a temp file, then open it (see
// src/electron/open-with-temp-file.js).

import {isElectronRenderer} from './is-electron';
import {Story} from '../store/stories';

/**
 * Launch options. These are similar, but not the same as PublishOptions.
 */
export interface LaunchStoryOptions {
	mode: 'play' | 'proof' | 'test';

	/**
	 * GUID of the start passage, overriding what is normally set in the story.
	 */
	startId?: string;
}

export async function launchStory(
	stories: Story[],
	storyId: string,
	options: LaunchStoryOptions
) {
	if (isElectronRenderer()) {
		// TODO: implement :)
		throw new Error('Not implemented yet');
		// const html = await publishStory(store, storyId, {
		// 	proof,
		// 	startPassage,
		// 	test
		// });

		// window.twineElectron.ipcRenderer.send(
		// 	'open-with-temp-file',
		// 	html,
		// 	'.html'
		// );
	} else {
		switch (options.mode) {
			case 'play':
				window.open(`/stories/${storyId}/play`, '_blank');
				break;

			case 'proof':
				window.open(`/stories/${storyId}/proof`, '_blank');
				break;

			case 'test':
				window.open(
					options.startId
						? `/stories/${storyId}/test/${options.startId}`
						: `/stories/${storyId}/test`,
					'_blank'
				);
				break;
		}
	}
}

export default launchStory;
