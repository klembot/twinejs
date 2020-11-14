import localStorage from '../index';
import * as pref from '../pref';
import * as story from '../story';
import * as storyFormat from '../story-format';
import {fakeStoryObject} from '../../../../test-utils/fakes';

describe('local-storage persistence', () => {
	jest.unmock('../pref');
	jest.unmock('../story');
	jest.unmock('../story-format');
	let mutationObserver, store;

	/* Mimic the Vuex subscribe() flow. */

	function dispatchMutation(mutation) {
		if (mutationObserver) {
			mutationObserver(mutation, store.state);
		}
	}

	beforeEach(() => {
		store = {
			commit: jest.fn(),
			subscribe(callback) {
				mutationObserver = callback;
			},
			state: {
				pref: {},
				story: {stories: [fakeStoryObject()]},
				storyFormat: {formats: []}
			}
		};

		pref.load = jest.fn();
		pref.save = jest.fn();
		story.load = jest.fn();
		story.deletePassage = jest.fn();
		story.deletePassageById = jest.fn();
		story.deleteStory = jest.fn();
		story.savePassage = jest.fn();
		story.saveStory = jest.fn();
		storyFormat.load = jest.fn();
		storyFormat.save = jest.fn();
		localStorage(store);
	});

	test('loads the pref, story, and story-format modules when starting', () => {
		expect(pref.load).toHaveBeenCalledTimes(1);
		expect(story.load).toHaveBeenCalledTimes(1);
		expect(storyFormat.load).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when a story/createStory mutation occurs', () => {
		dispatchMutation({
			type: 'story/createStory',
			payload: {storyProps: {name: store.state.story.stories[0].name}}
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when an story/updateStory mutation occurs', () => {
		dispatchMutation({
			type: 'story/updateStory',
			payload: {
				storyId: store.state.story.stories[0].id,
				storyProps: {name: 'mock-name'}
			}
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	it.skip('calls story.saveStory() when a DUPLICATE_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-id',
			name: 'Original Story',
			passages: []
		});

		store.state.story.stories.push({
			id: 'mock-id-2',
			name: 'Copied Story',
			passages: []
		});

		dispatchMutation({
			type: 'DUPLICATE_STORY',
			payload: ['mock-id', 'Copied Story']
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	it.skip('calls story.saveStory() when an IMPORT_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-id',
			name: 'Imported Story',
			passages: []
		});

		dispatchMutation({
			type: 'IMPORT_STORY',
			payload: [{name: 'Imported Story'}]
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.deleteStory() when an story/deleteStory mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-id',
			name: 'Imported Story',
			passages: []
		});

		dispatchMutation({
			type: 'story/deleteStory',
			payload: {storyId: 'mock-id'}
		});
		expect(story.deleteStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.savePassage() when a story/createPassage mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-story-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'mock-passage-id',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'story/createPassage',
			payload: {storyId: 'mock-story-id', passageProps: {name: 'A Passage'}}
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);
		expect(story.savePassage).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.savePassage() when an story/updatePassage mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-story-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'mock-passage-id',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'story/updatePassage',
			payload: {
				passageId: 'mock-passage-id',
				passageProps: {name: 'A Passage'},
				storyId: 'mock-story-id'
			}
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);
		expect(story.savePassage).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.deletePassage()/deletePassageById() when an story/deletePassage mutation occurs', () => {
		store.state.story.stories.push({
			id: 'mock-story-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'mock-passage-id',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'story/deletePassage',
			payload: {passageId: 'mock-passage-id', storyId: 'mock-story-id'}
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);
		expect(story.deletePassage).toHaveBeenCalledTimes(0);
		expect(story.deletePassageById).toHaveBeenCalledTimes(1);
	});

	test('calls pref.save() when an pref/update mutation occurs', () => {
		pref.save.mockClear();
		dispatchMutation({type: 'pref/update'});
		expect(pref.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when a storyFormat/createFormat mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'storyFormat/createFormat'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when an storyFormat/updateFormat mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'storyFormat/updateFormat'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when a storyFormat/deleteFormat mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'storyFormat/deleteFormat'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	it.skip('ignores LOAD_FORMAT mutations', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'LOAD_FORMAT'});
		expect(storyFormat.save).not.toHaveBeenCalled();
	});

	test('throws an error when given a mutation it does not know how to handle', () => {
		expect(() => {
			dispatchMutation({type: '???'});
		}).toThrow();
	});
});
