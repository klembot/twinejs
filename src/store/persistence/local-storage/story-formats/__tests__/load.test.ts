import {load} from '../load';
import {fakeUnloadedStoryFormat} from '../../../../../test-util';

describe('story formats local storage load', () => {
	const formatData = [fakeUnloadedStoryFormat(), fakeUnloadedStoryFormat()].map(
		format => ({
			name: format.name,
			version: format.version,
			url: format.url,
			id: format.id
		})
	);
	const formatIds = formatData.map(format => format.id).join(',');

	beforeEach(() => window.localStorage.clear());
	afterAll(() => window.localStorage.clear());

	it('restores formats', async () => {
		window.localStorage.setItem('twine-storyformats', formatIds);
		window.localStorage.setItem(
			`twine-storyformats-${formatData[0].id}`,
			JSON.stringify(formatData[0])
		);
		window.localStorage.setItem(
			`twine-storyformats-${formatData[1].id}`,
			JSON.stringify(formatData[1])
		);

		expect(await load()).toEqual([
			{...formatData[0], loadState: 'unloaded'},
			{...formatData[1], loadState: 'unloaded'}
		]);
	});
});
