import {TwineElectronWindow} from '../../../../electron/shared';
import {Story} from '../../../stories/stories.types';
import {importStories} from '../../../../util/import';

export function load(): Story[] {
	const {twineElectron} = window as TwineElectronWindow;

	// TODO make this consistent across modules

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	if (
		twineElectron?.hydrate?.stories &&
		Array.isArray(twineElectron.hydrate.stories)
	) {
		return twineElectron?.hydrate.stories.reduce((result, file) => {
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
