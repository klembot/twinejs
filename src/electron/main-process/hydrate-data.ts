import {PrefsState} from '../../store/prefs/prefs.types';
import {StoryFormatsState} from '../../store/story-formats/story-formats.types';
import {loadJsonFile} from './json-file';
import {createStoryDirectory, storyDirectoryPath} from './story-directory';
import {loadStories, StoryFile} from './story-file';
import {i18n} from './locales';

/**
 * Places data to be hydrated by the web context into a global variable, where
 * preload.ts can use it.
 */
interface GlobalWithHydrate {
	hydrate: {
		prefs?: PrefsState;
		storyFormats?: StoryFormatsState;
		stories?: StoryFile[];
	};
}

/**
 * Sets up global data for renderer processes to consume. This *must* be run
 * *after* locales are loaded.
 */
export async function hydrateGlobalData() {
	const glb = (global as unknown) as GlobalWithHydrate;

	glb.hydrate = {};

	try {
		glb.hydrate.prefs = await loadJsonFile('prefs.json');

		const locale = glb.hydrate.prefs?.locale ?? 'en-us';

		console.log(`Using ${locale} locale in Electron main process`);
		await i18n.changeLanguage(locale);
	} catch (e) {
		// We can recover from this because the render process will set defaults,
		// and we configure a fallback locale in src/i18n.js.

		console.warn(`Could not load prefs.json, skipping: ${e}`);
	}

	try {
		glb.hydrate.storyFormats = await loadJsonFile('story-formats.json');
	} catch (e) {
		// We can recover from this because the render process will set defaults.

		console.warn(`Could not load story-formats.json, skipping: ${e}`);
	}

	// We can't recover from this.

	console.log(`Loading stories from ${storyDirectoryPath()}`);
	await createStoryDirectory();
	glb.hydrate.stories = await loadStories();
	console.log(`${glb.hydrate.stories.length} stories loaded`);
}
