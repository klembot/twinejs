import {usePublishing} from './use-publishing';
import {isElectronRenderer} from '../util/is-electron';
import {TwineElectronWindow} from '../electron/shared';

export interface UseStoryLaunchProps {
	playStory: (storyId: string) => Promise<void>;
	proofStory: (storyId: string) => Promise<void>;
	testStory: (storyId: string, startPassageId?: string) => Promise<void>;
}

/**
 * Provides functions to launch a story that include the correct handling for
 * both web and Electron contexts.
 */
export function useStoryLaunch(): UseStoryLaunchProps {
	const {proofStory, publishStory} = usePublishing();

	if (isElectronRenderer()) {
		const {twineElectron} = window as TwineElectronWindow;

		if (!twineElectron) {
			throw new Error('Electron bridge is not present on window.');
		}

		return {
			playStory: async storyId => {
				twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					await publishStory(storyId),
					'.html'
				);
			},
			proofStory: async storyId => {
				twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					await proofStory(storyId),
					'.html'
				);
			},
			testStory: async (storyId, startPassageId) => {
				twineElectron.ipcRenderer.send(
					'open-with-temp-file',
					await publishStory(storyId, {
						formatOptions: 'debug',
						startId: startPassageId
					}),
					'.html'
				);
			}
		};
	}

	return {
		playStory: async storyId => {
			window.open(`#/stories/${storyId}/play`, '_blank');
		},
		proofStory: async storyId => {
			window.open(`#/stories/${storyId}/proof`, '_blank');
		},
		testStory: async (storyId, startPassageId) => {
			window.open(
				startPassageId
					? `#/stories/${storyId}/test/${startPassageId}`
					: `#/stories/${storyId}/test`,
				'_blank'
			);
		}
	};
}
