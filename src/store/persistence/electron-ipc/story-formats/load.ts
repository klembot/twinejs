import uuid from 'tiny-uuid';
import {TwineElectronWindow} from '../../../../electron/shared';
import {StoryFormatsState} from '../../../story-formats/story-formats.types';

export async function load(): Promise<StoryFormatsState> {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	const storyFormats = await twineElectron?.ipcRenderer.invoke(
		'load-story-formats'
	);

	if (!storyFormats || !Array.isArray(storyFormats)) {
		return [];
	}

	return storyFormats.map(data => ({
		id: uuid(),
		loadState: 'unloaded',
		name: data.name,
		selected: false,
		version: data.version,
		url: data.url,
		userAdded: data.userAdded
	}));
}
