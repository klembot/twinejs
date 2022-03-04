import {load} from '../load';

describe('prefs local storage load', () => {
	beforeEach(() => window.localStorage.clear());
	afterAll(() => window.localStorage.clear());

	it('restores preferences', async () => {
		window.localStorage.setItem('twine-prefs', 'mock-id,mock-id-2');
		window.localStorage.setItem(
			'twine-prefs-mock-id',
			JSON.stringify({
				name: 'foo',
				id: 'mock-id',
				value: true
			})
		);
		window.localStorage.setItem(
			'twine-prefs-mock-id-2',
			JSON.stringify({
				name: 'bar',
				id: 'mock-id-2',
				value: 1
			})
		);

		expect(await load()).toEqual({bar: 1, foo: true});
	});
});
