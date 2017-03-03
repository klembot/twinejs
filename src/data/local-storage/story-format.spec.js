const { expect } = require('chai');
const { match, spy } = require('sinon');
const storyFormat = require('./story-format');

describe('story format local storage persistence', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});
	
	it('persists formats', () => {
		const store = {
			state: {
				storyFormat: {
					formats: [
						{
							name: 'Format One',
							url: 'https://twinery.org'
						},
						{
							name: 'Format Two',
							url: 'https://twinery.org/wiki'
						}
					]
				}
			}
		};
		
		storyFormat.save(store);
		
		const ids = window.localStorage.getItem('twine-storyformats').split(',');

		expect(ids.length).to.equal(2);
		
		let saved = {};
		
		ids.forEach(id => {
			let savedFormat = window.localStorage.getItem(`twine-storyformats-${id}`);

			expect(savedFormat).to.be.a('string');
			const restored = JSON.parse(savedFormat);

			saved[restored.name] = restored;
		});
		
		expect(saved['Format One']).to.exist;
		expect(saved['Format One'].url).to.equal('https://twinery.org');
		expect(saved['Format Two']).to.exist;
		expect(saved['Format Two'].url).to.equal('https://twinery.org/wiki');
	});
		
	it('restores story formats', () => {
		window.localStorage.setItem('twine-storyformats', 'a-fake-id,another-fake-id');
		window.localStorage.setItem(
			'twine-storyformats-a-fake-id',
			JSON.stringify({
				name: 'Format 1',
				url: 'gopher://gopher.floodgap.com:70/1/'
			})
		);
		window.localStorage.setItem(
			'twine-storyformats-another-fake-id',
			JSON.stringify({
				name: 'Format 2',
				url: 'gopher://gopher.floodgap.com:70/0/gopher/wbgopher'
			})
		);
		
		let store = {
			dispatch: spy()
		};
		
		storyFormat.load(store);
		expect(store.dispatch.calledTwice).to.be.true;
		expect(store.dispatch.calledWith(
			'CREATE_FORMAT',
			match({ name: 'Format 1', url: 'gopher://gopher.floodgap.com:70/1/' }))
		).to.be.true;
		expect(store.dispatch.calledWith(
			'CREATE_FORMAT',
			match({ name: 'Format 2', url: 'gopher://gopher.floodgap.com:70/0/gopher/wbgopher' }))
		).to.be.true;
	});
});