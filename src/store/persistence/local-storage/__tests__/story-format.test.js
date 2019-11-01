import {load, save} from '../story-format';

describe('story format local storage persistence', () => {
	beforeEach(() => window.localStorage.clear());

	test('persists formats', () => {
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

		save(store);

		const ids = window.localStorage.getItem('twine-storyformats').split(',');

		expect(ids.length).toBe(2);

		let saved = {};

		ids.forEach(id => {
			let savedFormat = window.localStorage.getItem(`twine-storyformats-${id}`);

			expect(typeof savedFormat).toBe('string');
			const restored = JSON.parse(savedFormat);

			saved[restored.name] = restored;
		});

		expect(saved['Format One']).toBeDefined();
		expect(saved['Format One'].url).toBe('https://twinery.org');
		expect(saved['Format Two']).toBeDefined();
		expect(saved['Format Two'].url).toBe('https://twinery.org/wiki');
	});

	test('restores story formats', () => {
		window.localStorage.setItem('twine-storyformats', 'mock-id,mock-id-2');
		window.localStorage.setItem(
			'twine-storyformats-mock-id',
			JSON.stringify({
				name: 'Format 1',
				url: 'gopher://gopher.floodgap.com:70/1/'
			})
		);
		window.localStorage.setItem(
			'twine-storyformats-mock-id-2',
			JSON.stringify({
				name: 'Format 2',
				url: 'gopher://gopher.floodgap.com:70/0/gopher/wbgopher'
			})
		);

		let store = {commit: jest.fn()};

		load(store);
		expect(store.commit).toHaveBeenCalledTimes(2);
		expect(store.commit).toHaveBeenCalledWith('storyFormat/createFormat', {
			storyFormatProps: {
				name: 'Format 1',
				url: 'gopher://gopher.floodgap.com:70/1/'
			}
		});
		expect(store.commit).toHaveBeenCalledWith('storyFormat/createFormat', {
			storyFormatProps: {
				name: 'Format 2',
				url: 'gopher://gopher.floodgap.com:70/0/gopher/wbgopher'
			}
		});
	});
});
