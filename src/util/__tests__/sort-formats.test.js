import formatSorter from '../sort-formats';

describe('formatSorter', () => {
	it('sorts formats by name in descending order', () => {
		const formats = [
			{name: 'B', version: '1.0.0'},
			{name: 'A', version: '3.0.0'},
			{name: 'C', version: '2.0.0'}
		];

		expect(formats.sort(formatSorter)).toEqual([
			{name: 'A', version: '3.0.0'},
			{name: 'B', version: '1.0.0'},
			{name: 'C', version: '2.0.0'}
		]);
	});

	it('sorts formats with the same name in ascending version number', () => {
		const formats = [
			{name: 'A', version: '1.0.0'},
			{name: 'A', version: '3.0.0'},
			{name: 'B', version: '2.0.0'},
			{name: 'B', version: '2.1.3'},
			{name: 'B', version: '2.1.0'},
			{name: 'B', version: '4.0.0'}
		];

		expect(formats.sort(formatSorter)).toEqual([
			{name: 'A', version: '3.0.0'},
			{name: 'A', version: '1.0.0'},
			{name: 'B', version: '4.0.0'},
			{name: 'B', version: '2.1.3'},
			{name: 'B', version: '2.1.0'},
			{name: 'B', version: '2.0.0'}
		]);
	});
});
