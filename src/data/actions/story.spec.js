const {spy} = require('sinon');
const actions = require('./story');

describe('story actions module', () => {
	const props = {fake: true};
	const fakeId = 'not-a-real-id';
	let store;

	beforeEach(() => {
		store = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'My Default Format',
						version: '1.2.3'
					}
				}
			}
		};
	});

	test('dispatches a CREATE_STORY mutation with createStory()', () => {
		const props = {
			name: 'A New Story',
			storyFormat: 'Test Format',
			storyFormatVersion: '1.0.0'
		};

		actions.createStory(store, props);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('CREATE_STORY', props)).toBe(true);
	});

	test('ensures a story created with createStory() always has a story format set', () => {
		actions.createStory(store, {name: 'A New Story'});
		expect(store.dispatch.calledOnce).toBe(true);
		expect(
			store.dispatch.calledWith('CREATE_STORY', {
				name: 'A New Story',
				storyFormat: 'My Default Format',
				storyFormatVersion: '1.2.3'
			})
		).toBe(true);
	});

	test('dispatches a DELETE_STORY mutation with deleteStory()', () => {
		actions.deleteStory(store, fakeId);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('DELETE_STORY', fakeId)).toBe(true);
	});

	test('dispatches a DUPLICATE_STORY mutation with duplicateStory()', () => {
		actions.duplicateStory(store, fakeId, 'Another Name');
		expect(store.dispatch.calledOnce).toBe(true);
		expect(
			store.dispatch.calledWith('DUPLICATE_STORY', fakeId, 'Another Name')
		).toBe(true);
	});

	test('dispatches an IMPORT_STORY mutation with importStory()', () => {
		actions.importStory(store, props);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('IMPORT_STORY', props)).toBe(true);
	});

	test('dispatches an UPDATE_STORY mutation with updateStory()', () => {
		actions.updateStory(store, fakeId, props);
		expect(store.dispatch.calledOnce).toBe(true);
		expect(store.dispatch.calledWith('UPDATE_STORY', fakeId, props)).toBe(
			true
		);
	});

	test('sets default formats on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {name: 'Default Format', version: '1.2.3'}
				},
				storyFormat: {
					formats: [{name: 'Default Format', version: '1.2.3'}]
				},
				story: {
					stories: [{id: 'not-a-real-id'}]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(
			storiesStore.dispatch.calledWith('UPDATE_STORY', 'not-a-real-id', {
				storyFormat: 'Default Format'
			})
		).toBe(true);
	});

	test('coerces old SugarCube references to their correct versions with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'SugarCube 1 (local/offline)'
						},
						{
							id: 'also-not-a-real-id',
							storyFormat: 'SugarCube 2 (local/offline)'
						}
					]
				},
				storyFormat: {
					formats: [
						{name: 'SugarCube', version: '1.2.3'},
						{name: 'SugarCube', version: '2.3.4'}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(
			storiesStore.dispatch.calledWith('UPDATE_STORY', 'not-a-real-id', {
				storyFormat: 'SugarCube',
				storyFormatVersion: '1.2.3'
			})
		).toBe(true);
		expect(
			storiesStore.dispatch.calledWith(
				'UPDATE_STORY',
				'also-not-a-real-id',
				{storyFormat: 'SugarCube', storyFormatVersion: '2.3.4'}
			)
		).toBe(true);
	});

	test('sets format versions on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				storyFormat: {
					formats: [
						{name: 'Default Format', version: '1.2.3'},
						{name: 'Default Format', version: '1.2.5'}
					]
				},
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'Default Format'
						},
						{
							id: 'also-not-a-real-id',
							storyFormat: 'Default Format',
							storyFormatVersion: ''
						}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(
			storiesStore.dispatch.calledWith('UPDATE_STORY', 'not-a-real-id', {
				storyFormatVersion: '1.2.5'
			})
		).toBe(true);
		expect(
			storiesStore.dispatch.calledWith(
				'UPDATE_STORY',
				'also-not-a-real-id',
				{storyFormatVersion: '1.2.5'}
			)
		).toBe(true);
	});

	test('updates story format versions with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				storyFormat: {
					formats: [
						{name: 'Default Format', version: '1.2.3'},
						{name: 'Default Format', version: '1.2.5'}
					]
				},
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'Default Format',
							storyFormatVersion: '1.0.0'
						}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(
			storiesStore.dispatch.calledWith('UPDATE_STORY', 'not-a-real-id', {
				storyFormatVersion: '1.2.5'
			})
		).toBe(true);
	});

	test('leaves story format versions alone if the story is already up-to-date', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				storyFormat: {
					formats: [
						{name: 'Default Format', version: '1.2.3'},
						{name: 'Default Format', version: '1.2.5'}
					]
				},
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'Default Format',
							storyFormatVersion: '1.2.5'
						}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(storiesStore.dispatch.notCalled).toBe(true);
	});

	test('leaves stories alone if their story format does not exist', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				storyFormat: {
					formats: [{name: 'Default Format', version: '1.2.3'}]
				},
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'No Format',
							storyFormatVersion: '1.0.0'
						}
					]
				}
			}
		};

		expect(() => actions.repairStories(storiesStore)).not.toThrowError();
	});
});
