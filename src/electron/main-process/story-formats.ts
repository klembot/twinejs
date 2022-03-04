import {loadJsonFile} from './json-file';

export async function loadStoryFormats() {
	return await loadJsonFile('story-formats.json');
}
