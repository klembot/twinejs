import {loadJsonFile} from './json-file';

/**
 * Loads prefs shared by both web and app versions.
 */
export async function loadPrefs() {
	return await loadJsonFile('prefs.json');
}