import {loadJsonFile} from './json-file';

export async function loadPrefs() {
	return await loadJsonFile('prefs.json');
}
