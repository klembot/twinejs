const { match, spy } = require('sinon');
const story = require('./story');

describe('story local storage persistence', () => {
	const testStory = {
		id: 'not-a-real-id',
		name: 'Test Story',
		startPassage: 100,
		zoom: 1.5,
		snapToGrid: true,
		stylesheet: '* { color: red }',
		script: 'console.log("hi")',
		storyFormat: 'Harlowe'
	};
	
	const testPassage = {
		id: 'also-not-a-real-id',
		story: 'not-a-real-id',
		top: 20,
		left: 30,
		width: 120,
		height: 90,
		tags: ['foo', 'bar'],
		name: 'Test Passage',
		text: 'Hello world.'
	};
	
	beforeEach(() => {
		window.localStorage.clear();
	});
	
	test('saves a story with saveStory()', () => {
		story.update(transaction => {
			story.saveStory(transaction, testStory);
		});
		
		const saved = window.localStorage.getItem(`twine-stories-${testStory.id}`);

		expect(typeof saved).toBe('string');
		const savedStory = JSON.parse(saved);
		
		Object.keys(testStory).forEach(key => {
			expect(savedStory[key]).toBe(testStory[key]);
		});
	});
	
	test('deletes a story *only* with deleteStory()', () => {
		story.update(transaction => {
			story.saveStory(transaction, testStory);
		});
		
		expect(window.localStorage.getItem('twine-stories')).toBe(testStory.id);
		
		story.update(transaction => {
			story.deleteStory(transaction, testStory);
		});
		
		expect(window.localStorage.getItem('twine-stories')).toBe('');
	});
	
	test('saves a passage with savePassage()', () => {
		story.update(transaction => {
			story.savePassage(transaction, testPassage);
		});
		
		const saved = window.localStorage.getItem(`twine-passages-${testPassage.id}`);
		
		expect(typeof saved).toBe('string');
		
		const savedPassage = JSON.parse(saved);

		Object.keys(testPassage).forEach(key => {
			if (key === 'tags') {
				testPassage.tags.forEach(i => {
					expect(savedPassage.tags[i]).toBe(testPassage.tags[i]);
				});
			}
			else {
				expect(savedPassage[key]).toBe(testPassage[key]);
			}
		});
	});
	
	test('deletes a passage with deletePassage()', () => {
		story.update(transaction => {
			story.savePassage(transaction, testPassage);
		});
		
		expect(window.localStorage.getItem('twine-passages')).toBe(testPassage.id);
 		
		story.update(transaction => {
			story.deletePassage(transaction, testPassage);
		});
		
		expect(window.localStorage.getItem('twine-passages')).toBe('');
	});
	
	test('deletes a passage with deletePassageById()', () => {
		story.update(transaction => {
			story.savePassage(transaction, testPassage);
		});
		
		expect(window.localStorage.getItem('twine-passages')).toBe(testPassage.id);
 		
		story.update(transaction => {
			story.deletePassageById(transaction, testPassage.id);
		});
		
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
		
		let store = { dispatch: spy() };
		
		story.load(store);
		expect(store.dispatch.calledOnce).toBe(true);
		
		const firstArgs = store.dispatch.getCall(0).args;
		
		expect(firstArgs[0]).toBe('CREATE_STORY');
		
		Object.keys(testStory).forEach(key => {
			if (key === 'passages') {
				expect(firstArgs[1].passages.length).toBe(1);
				
				Object.keys(testPassage).forEach(key => {
					if (key === 'tags') {
						testPassage.tags.forEach(i => {
							expect(firstArgs[1].tags[i]).toBe(testPassage.tags[i]);
						});
					}
					else {
						expect(firstArgs[1].passages[0][key]).toBe(testPassage[key]);
					}
				});
			}
			else {
				expect(firstArgs[1][key]).toBe(testStory[key]);
			}
		});
	});
});