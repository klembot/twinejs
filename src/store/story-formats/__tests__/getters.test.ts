import {
	filteredFormats,
	formatImageUrl,
	formatWithId,
	formatWithNameAndVersion,
	newestFormatNamed,
	sortFormats
} from '../getters';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat
} from '../../../test-util';

describe('filteredFormats', () => {
	it("returns all formats if the 'all' filter is passed", () => {
		const format1 = fakeLoadedStoryFormat({userAdded: true});
		const format2 = fakeLoadedStoryFormat({userAdded: false});

		expect(filteredFormats([format1, format2], 'all')).toEqual([
			format1,
			format2
		]);
	});

	it("returns all user-added formats if the 'user' filter is passed", () => {
		const format1 = fakeLoadedStoryFormat({userAdded: true});
		const format2 = fakeLoadedStoryFormat({userAdded: false});

		expect(filteredFormats([format1, format2], 'user')).toEqual([format1]);
	});

	it("returns the latest version of each format if the 'current' filter is passed", () => {
		const format1 = fakeLoadedStoryFormat({
			name: 'mock-name-1',
			version: '1.2.3'
		});
		const format2 = fakeLoadedStoryFormat({
			name: 'mock-name-1',
			version: '2.3.4'
		});
		const format3 = fakeLoadedStoryFormat({
			name: 'mock-name-2',
			version: '1.4.4'
		});

		expect(filteredFormats([format1, format2, format3], 'current')).toEqual([
			format2,
			format3
		]);
	});
});

describe('formatImageUrl', () => {
	it('throws an error if the format is not loaded', () => {
		expect(() => formatImageUrl(fakeFailedStoryFormat())).toThrow();
		expect(() => formatImageUrl(fakePendingStoryFormat())).toThrow();
	});

	it('returns a relative URL to the story format', () => {
		const format = fakeLoadedStoryFormat(
			{url: 'https://mock/path/format.js'},
			{image: 'mock-image.svg'}
		);

		expect(formatImageUrl(format)).toBe('https://mock/path/mock-image.svg');
	});

	it('returns a relative URL to the app if the story format URL itself is relative', () => {
		const format = fakeLoadedStoryFormat(
			{url: 'mock/path/format.js'},
			{image: 'mock-image.svg'}
		);

		expect(formatImageUrl(format)).toBe('mock/path/mock-image.svg');
	});

	it('preserves absolute URLs', () => {
		const image = 'http://mock/image.svg';
		const format = fakeLoadedStoryFormat({}, {image});

		expect(formatImageUrl(format)).toBe(image);
	});
});

describe('formatWithId', () => {
	it('returns the format with the appropriate ID', () => {
		const formats = [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()];

		expect(formatWithId(formats, formats[1].id)).toBe(formats[1]);
	});

	it('throws an error if the format does not exist', () => {
		const formats = [fakeLoadedStoryFormat()];

		expect(() =>
			formatWithId(formats, formats[0].id + 'nonexistent')
		).toThrow();
	});
});

describe('formatWithNameAndVersion', () => {
	it('returns the format with the appropriate name and version', () => {
		const formats = [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()];

		expect(
			formatWithNameAndVersion(formats, formats[1].name, formats[1].version)
		).toBe(formats[1]);
	});

	it('does a case-sensitive match on names', () => {
		const formats = [fakeLoadedStoryFormat()];

		expect(() =>
			formatWithNameAndVersion(
				formats,
				formats[0].name.toUpperCase(),
				formats[0].version
			)
		).toThrow();
	});

	it('does an exact match on versions', () => {
		const formats = [fakeLoadedStoryFormat()];
		const versionBits = formats[0].version.split('.');

		expect(() =>
			formatWithNameAndVersion(
				formats,
				formats[0].name,
				`${versionBits[0]}.${versionBits[1]}.1000`
			)
		).toThrow();
	});

	it('throws an error if the format does not exist', () => {
		const formats = [fakeLoadedStoryFormat()];

		expect(() =>
			formatWithId(formats, formats[0].id + 'nonexistent')
		).toThrow();
	});
});

describe('newestFormatWithName', () => {
	it('returns the newest format in the arguments passed', () =>
		expect(
			newestFormatNamed(
				[
					fakePendingStoryFormat({name: 'mock-name', version: '1.0.0'}),
					fakePendingStoryFormat({name: 'mock-name', version: '1.0.1'}),
					fakePendingStoryFormat({name: 'other-name', version: '2.0.0'})
				],
				'mock-name'
			)
		).toEqual(expect.objectContaining({name: 'mock-name', version: '1.0.1'})));

	it('returns undefined if no formats match the name passed', () =>
		expect(
			newestFormatNamed(
				[
					fakePendingStoryFormat({name: 'mock-name', version: '1.0.0'}),
					fakePendingStoryFormat({name: 'mock-name', version: '1.0.1'}),
					fakePendingStoryFormat({name: 'mock-name', version: '2.0.0'})
				],
				'other-name'
			)
		).toBeUndefined());
});

describe('sortFormats', () => {
	it('sorts first by name ascending', () => {
		const sorted = sortFormats([
			fakePendingStoryFormat({name: 'mock-2', version: '3.2.1'}),
			fakePendingStoryFormat({name: 'mock-1', version: '1.2.3'})
		]);

		expect(sorted).toEqual([
			expect.objectContaining({name: 'mock-1', version: '1.2.3'}),
			expect.objectContaining({name: 'mock-2', version: '3.2.1'})
		]);
	});

	it('sorts formats with the same name on version descending', () => {
		const sorted = sortFormats([
			fakePendingStoryFormat({name: 'mock', version: '1.2.3'}),
			fakePendingStoryFormat({name: 'mock', version: '10.2.3'})
		]);

		expect(sorted).toEqual([
			expect.objectContaining({name: 'mock', version: '10.2.3'}),
			expect.objectContaining({name: 'mock', version: '1.2.3'})
		]);
	});
});