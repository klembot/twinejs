import {TwineElectronWindow} from '../../../../electron/shared';
import {Story} from '../../../stories/stories.types';
import {importStories} from '../../../../util/import';

export async function load(): Promise<Story[]> {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	const stories = await twineElectron?.ipcRenderer.invoke('load-stories');

	if (stories && Array.isArray(stories)) {
		return stories.reduce((result, file) => {
			const story = importStories(file.htmlSource, file.mtime);

			if (story[0]) {
				return [...result, story[0]];
			}

			console.warn('Could not hydrate story: ', file.htmlSource);
			return result;
		}, [] as Story[]);
	} else {
		console.warn('No stories to hydrate in Electron bridge');
	}

	return [];
}
