import {fakePendingStoryFormat} from '../../../test-util';
import {loadJsonFile} from '../json-file';
import {loadStoryFormats} from '../story-formats';

jest.mock('../json-file');

describe('loadStoryFormats()', () => {
	const loadJsonFileMock = loadJsonFile as jest.Mock;

	it('resolves to the result of loading story-formats.json', async () => {
		const formats = [fakePendingStoryFormat(), fakePendingStoryFormat()];

		loadJsonFileMock.mockImplementation((name: string) => {
			if (name === 'story-formats.json') {
				return Promise.resolve(formats);
			}

			throw new Error(`Loaded incorrect file "${name}"`);
		});
		expect(await loadStoryFormats()).toBe(formats);
	});
});
