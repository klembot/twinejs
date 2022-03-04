import {fakePrefs} from '../../../test-util';
import {loadJsonFile} from '../json-file';
import {loadPrefs} from '../prefs';

jest.mock('../json-file');

describe('loadPrefs()', () => {
	const loadJsonFileMock = loadJsonFile as jest.Mock;

	it('resolves to the result of loading prefs.json', async () => {
		const prefs = fakePrefs();

		loadJsonFileMock.mockImplementation((name: string) => {
			if (name === 'prefs.json') {
				return Promise.resolve(prefs);
			}

			throw new Error(`Loaded incorrect file "${name}"`);
		});
		expect(await loadPrefs()).toBe(prefs);
	});
});
