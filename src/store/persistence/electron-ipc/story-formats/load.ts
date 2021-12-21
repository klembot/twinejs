import uuid from 'tiny-uuid';
import {TwineElectronWindow} from '../../../../electron/shared';
import {StoryFormatsState} from '../../../story-formats/story-formats.types';

export function load(): StoryFormatsState {
	const {twineElectron} = window as TwineElectronWindow;

	if (
		!twineElectron?.hydrate?.storyFormats ||
		!Array.isArray(twineElectron.hydrate.storyFormats)
	) {
		return [];
	}

	return twineElectron.hydrate.storyFormats.map(data => ({
		id: uuid(),
		loadState: 'unloaded',
		name: data.name,
		selected: false,
		version: data.version,
		url: data.url,
		userAdded: data.userAdded
	}));
}
