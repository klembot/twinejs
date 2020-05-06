import {
	deletePassage,
	deletePassageById,
	deleteStory,
	load,
	savePassage,
	saveStory,
	update
} from '../story';

describe('story local storage persistence', () => {
	const testStory = {
		id: 'mock-story-id',
		name: 'Test Story',
		script: 'console.log("hi")',
		startPassage: 'mock-passage-id',
		snapToGrid: true,
		storyFormat: 'Harlowe',
		stylesheet: '* { color: red }',
		zoom: 1.5
	};

	const testPassage = {
		id: 'mock-passage-id',
		story: 'mock-story-id',
		top: 20,
		left: 30,
		width: 120,
		height: 90,
		tags: ['foo', 'bar'],
		name: 'Test Passage',
		text: 'Hello world.'
	};

	beforeEach(() => window.localStorage.clear());

	test('saves a story with saveStory()', () => {
		update(transaction => saveStory(transaction, testStory));

		const saved = window.localStorage.getItem(`twine-stories-${testStory.id}`);

		expect(typeof saved).toBe('string');

		const savedStory = JSON.parse(saved);

		Object.keys(testStory).forEach(key =>
			expect(savedStory[key]).toBe(testStory[key])
		);
	});

	test('deletes a story *only* with deleteStory()', () => {
		update(transaction => saveStory(transaction, testStory));
		expect(window.localStorage.getItem('twine-stories')).toBe(testStory.id);
		update(transaction => deleteStory(transaction, testStory));
		expect(window.localStorage.getItem('twine-stories')).toBe('');
	});

	test('saves a passage with savePassage()', () => {
		update(transaction => {
			savePassage(transaction, testPassage);
		});

		const saved = window.localStorage.getItem(
			`twine-passages-${testPassage.id}`
		);

		expect(typeof saved).toBe('string');

		const savedPassage = JSON.parse(saved);

		Object.keys(testPassage).forEach(key => {
			if (key === 'tags') {
				testPassage.tags.forEach(i => {
					expect(savedPassage.tags[i]).toBe(testPassage.tags[i]);
				});
			} else {
				expect(savedPassage[key]).toBe(testPassage[key]);
			}
		});
	});

	test('deletes a passage with deletePassage()', () => {
		update(transaction => savePassage(transaction, testPassage));
		expect(window.localStorage.getItem('twine-passages')).toBe(testPassage.id);
		update(transaction => deletePassage(transaction, testPassage));
		expect(window.localStorage.getItem('twine-passages')).toBe('');
	});

	test('deletes a passage with deletePassageById()', () => {
		update(transaction => savePassage(transaction, testPassage));
		expect(window.localStorage.getItem('twine-passages')).toBe(testPassage.id);
		update(transaction => deletePassageById(transaction, testPassage.id));
		expect(window.localStorage.getItem('twine-passages')).toBe('');
	});

	test('restores stories with load()', () => {
		window.localStorage.setItem('twine-stories', testStory.id);
		window.localStorage.setItem(
			`twine-stories-${testStory.id}`,
			JSON.stringify(testStory)
		);
		window.localStorage.setItem('twine-passages', testPassage.id);
		window.localStorage.setItem(
			`twine-passages-${testPassage.id}`,
			JSON.stringify(testPassage)
		);

		let store = {commit: jest.fn()};

		load(store);
		expect(store.commit).toHaveBeenCalledTimes(1);

		const firstArgs = store.commit.mock.calls[0];
		const {storyProps} = firstArgs[1];

		expect(firstArgs[0]).toBe('story/createStory');
		expect(storyProps.passages[0].story).toBe(storyProps.id);

		Object.keys(testStory).forEach(key => {
			if (key === 'passages') {
				expect(storyProps.passages.length).toBe(1);

				Object.keys(testPassage).forEach(key => {
					if (key === 'tags') {
						testPassage.tags.forEach(i => {
							expect(storyProps.tags[i]).toBe(testPassage.tags[i]);
						});
					} else {
						expect(storyProps.passages[0][key]).toBe(testPassage[key]);
					}
				});
			} else {
				expect(storyProps[key]).toBe(testStory[key]);
			}
		});
	});
});
