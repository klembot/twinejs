const { spy } = require('sinon');
const pref = require('./pref');

describe('pref local storage persistence', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});
	
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
		
		pref.save(store);
		
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
		window.localStorage.setItem('twine-prefs', 'a-fake-id,another-fake-id');
		window.localStorage.setItem(
			'twine-prefs-a-fake-id',
			JSON.stringify({
				name: 'foo',
				id: 'a-fake-id',
				value: true
			})
		);
		window.localStorage.setItem(
			'twine-prefs-another-fake-id',
			JSON.stringify({
				name: 'bar',
				id: 'another-fake-id',
				value: 1
			})
		);
		
		let store = {
			dispatch: spy()
		};
		
		pref.load(store);
		expect(store.dispatch.calledTwice).toBe(true);
		expect(store.dispatch.calledWith('UPDATE_PREF', 'foo', true)).toBe(true);
		expect(store.dispatch.calledWith('UPDATE_PREF', 'bar', 1)).toBe(true);
	});
});