import actions from './story';

describe('story actions module', () => {
	const props = {fake: true};
	const fakeId = 'not-a-real-id';
	let store;

	beforeEach(() => {
		store = {
			dispatch: jest.fn(),
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
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('CREATE_STORY', props);
	});

	test('ensures a story created with createStory() always has a story format set', () => {
		actions.createStory(store, {name: 'A New Story'});
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('CREATE_STORY', {
			name: 'A New Story',
			storyFormat: 'My Default Format',
			storyFormatVersion: '1.2.3'
		});
	});

	test('dispatches a DELETE_STORY mutation with deleteStory()', () => {
		actions.deleteStory(store, fakeId);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('DELETE_STORY', fakeId);
	});

	test('dispatches a DUPLICATE_STORY mutation with duplicateStory()', () => {
		actions.duplicateStory(store, fakeId, 'Another Name');
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith(
			'DUPLICATE_STORY',
			fakeId,
			'Another Name'
		);
	});

	test('dispatches an IMPORT_STORY mutation with importStory()', () => {
		actions.importStory(store, props);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('IMPORT_STORY', props);
	});

	test('dispatches an UPDATE_STORY mutation with updateStory()', () => {
		actions.updateStory(store, fakeId, props);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('UPDATE_STORY', fakeId, props);
	});

	test('sets default formats on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{
				storyFormat: 'Default Format'
			}
		);
	});

	test('coerces old SugarCube references to their correct versions with repairStories()', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{
				storyFormat: 'SugarCube',
				storyFormatVersion: '1.2.3'
			}
		);
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'also-not-a-real-id',
			{storyFormat: 'SugarCube', storyFormatVersion: '2.3.4'}
		);
	});

	test('sets format versions on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{
				storyFormatVersion: '1.2.5'
			}
		);
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'also-not-a-real-id',
			{storyFormatVersion: '1.2.5'}
		);
	});

	test('updates story format versions with repairStories()', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
		expect(storiesStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{
				storyFormatVersion: '1.2.5'
			}
		);
	});

	test('leaves story format versions alone if the story is already up-to-date', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
		expect(storiesStore.dispatch).not.toBeCalled();
	});

	test('leaves stories alone if their story format does not exist', () => {
		let storiesStore = {
			dispatch: jest.fn(),
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
