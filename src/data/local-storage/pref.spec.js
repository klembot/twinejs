const { expect } = require('chai');
const { spy } = require('sinon');
const pref = require('./pref');

describe('pref local storage persistence', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});
	
	it('persists preferences', () => {
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

		expect(ids.length).to.equal(3);
		
		let saved = {};
		
		ids.forEach(id => {
			let savedPref = window.localStorage.getItem(`twine-prefs-${id}`);

			expect(savedPref).to.be.a('string');
			const restored = JSON.parse(savedPref);

			saved[restored.name] = restored.value;
		});
		
		expect(saved.foo).to.equal(true);
		expect(saved.bar).to.equal(1);
		expect(saved.baz).to.equal('a string');
	});
	
	it('restores preferences', () => {
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
		expect(store.dispatch.calledTwice).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PREF', 'foo', true)).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PREF', 'bar', 1)).to.be.true;
	});
});