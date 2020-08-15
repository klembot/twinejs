import {fakeLoadedStoryFormatObject} from '@/test-utils';
import {formatWithId, latestFormat} from '../getters';

describe('Story format Vuex getters', () => {
	describe('formatWithId', () => {
		const mockState = {
			formats: [fakeLoadedStoryFormatObject(), fakeLoadedStoryFormatObject()]
		};

		it('locates a format with an ID', () => {
			expect(formatWithId(mockState)(mockState.formats[1].id)).toBe(
				mockState.formats[1]
			);
		});

		it('returns undefined if no format matches', () => {
			expect(formatWithId(mockState)(-1)).toBeUndefined();
		});
	});

	describe('latestFormat', () => {
		it('returns a format if only one exists', () => {
			const format = {name: 'mock-story-format', version: '1.0.0'};
			const mockState = {formats: [format]};

			expect(latestFormat(mockState)('mock-story-format', '1.2.3')).toBe(
				format
			);
		});

		it('returns undefined if no formats with the name exist', () => {
			const format = {name: 'mock-story-format', version: '1.0.0'};
			const mockState = {formats: [format]};

			expect(latestFormat(mockState)('nonexistent', '1.2.3')).toBeUndefined();
		});

		it('returns undefined if no formats with the same major version exist', () => {
			const mockState = {
				formats: [
					{name: 'mock-story-format', version: '3.0.0'},
					{name: 'mock-story-format', version: '1.0.0'}
				]
			};

			expect(
				latestFormat(mockState)('mock-story-format', '2.0.0')
			).toBeUndefined();
		});

		it('returns the format with the highest minor version number', () => {
			const format = {name: 'mock-story-format', version: '1.4.0'};
			const mockState = {
				formats: [format, {name: 'mock-story-format', version: '1.0.10'}]
			};

			expect(latestFormat(mockState)('mock-story-format', '1.2.3')).toBe(
				format
			);
		});

		it('ignores formats with a higher or lower major version number', () => {
			const format = {name: 'mock-story-format', version: '2.0.1'};
			const mockState = {
				formats: [
					format,
					{name: 'mock-story-format', version: '3.0.0'},
					{name: 'mock-story-format', version: '1.0.0'}
				]
			};

			expect(latestFormat(mockState)('mock-story-format', '2.3.4')).toBe(
				format
			);
		});
	});
});
