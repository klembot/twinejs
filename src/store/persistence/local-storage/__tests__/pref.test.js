import {load, save} from '../pref';

describe('pref local storage persistence', () => {
	beforeEach(() => window.localStorage.clear());

	test('persists preferences', () => {
		const store = {
			state: {
				pref: {
					foo: true,
					bar: 1,
					baz: 'a string'
				}
			}
		};

		save(store);

		const ids = window.localStorage.getItem('twine-prefs').split(',');

		expect(ids.length).toBe(3);

		let saved = {};

		ids.forEach(id => {
			let savedPref = window.localStorage.getItem(`twine-prefs-${id}`);

			expect(typeof savedPref).toBe('string');
			const restored = JSON.parse(savedPref);

			saved[restored.name] = restored.value;
		});

		expect(saved.foo).toBe(true);
		expect(saved.bar).toBe(1);
		expect(saved.baz).toBe('a string');
	});

	test('restores preferences', () => {
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

		let store = {commit: jest.fn()};

		load(store);
		expect(store.commit).toHaveBeenCalledTimes(1);
		expect(store.commit).toHaveBeenCalledWith('pref/update', {
			bar: 1,
			foo: true
		});
	});
});
