import localStorage from './index';
import pref from './pref';
import story from './story';
import storyFormat from './story-format';

describe('local-storage persistence', () => {
	jest.unmock('./pref');
	jest.unmock('./story');
	jest.unmock('./story-format');
	let store;

	/* Mimic the Vuex subscribe() flow. */

	function dispatchMutation(mutation) {
		mutationObserver(mutation, store.state);
	}

	beforeEach(() => {
		store = {
			dispatch: jest.fn(),
			subscribe: function(callback) {
				mutationObserver = callback;
			},
			state: {
				pref: {},
				story: {stories: []},
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
	});

	test('loads the pref, story, and story-format modules when starting', () => {
		localStorage(store);
		expect(pref.load).toHaveBeenCalledTimes(1);
		expect(story.load).toHaveBeenCalledTimes(1);
		expect(storyFormat.load).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when a CREATE_STORY mutation occurs', () => {
		dispatchMutation({
			type: 'CREATE_STORY',
			payload: [{name: 'A Story'}]
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when an UPDATE_STORY mutation occurs', () => {
		dispatchMutation({
			type: 'UPDATE_STORY',
			payload: ['not-an-id']
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when a DUPLICATE_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Original Story',
			passages: []
		});

		store.state.story.stories.push({
			id: 'not-an-id-either',
			name: 'Copied Story',
			passages: []
		});

		dispatchMutation({
			type: 'DUPLICATE_STORY',
			payload: ['not-an-id', 'Copied Story']
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() when an IMPORT_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: []
		});

		dispatchMutation({
			type: 'IMPORT_STORY',
			payload: [{name: 'Imported Story'}]
		});
		expect(story.saveStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.deleteStory() when an DELETE_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: []
		});

		dispatchMutation({
			type: 'DELETE_STORY',
			payload: ['not-an-id']
		});
		expect(story.deleteStory).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.savePassage() when a CREATE_PASSAGE_IN_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'not-an-id-either',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'CREATE_PASSAGE_IN_STORY',
			payload: ['not-an-id', {name: 'A Passage'}]
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);
		expect(story.savePassage).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.savePassage() when an UPDATE_PASSAGE_IN_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'not-an-id-either',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'CREATE_PASSAGE_IN_STORY',
			payload: ['not-an-id', {name: 'A Passage'}]
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);
		expect(story.savePassage).toHaveBeenCalledTimes(1);
	});

	test('calls story.saveStory() and story.deletePassage()/deletePassageById() when an DELETE_PASSAGE_IN_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: [
				{
					id: 'not-an-id-either',
					name: 'A Passage'
				}
			]
		});

		dispatchMutation({
			type: 'DELETE_PASSAGE_IN_STORY',
			payload: ['not-an-id', {name: 'A Passage'}]
		});

		expect(story.saveStory).toHaveBeenCalledTimes(1);

		expect(story.deletePassage).toHaveBeenCalledTimes(0);
		expect(story.deletePassageById).toHaveBeenCalledTimes(1);
	});

	test('calls pref.save() when an UPDATE_PREF mutation occurs', () => {
		pref.save.mockClear();
		dispatchMutation({type: 'UPDATE_PREF'});
		expect(pref.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when a CREATE_FORMAT mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'CREATE_FORMAT'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when an UPDATE_FORMAT mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'UPDATE_FORMAT'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	test('calls storyFormat.save() when a DELETE_FORMAT mutation occurs', () => {
		storyFormat.save.mockClear();
		dispatchMutation({type: 'DELETE_FORMAT'});
		expect(storyFormat.save).toHaveBeenCalledTimes(1);
	});

	test('ignores LOAD_FORMAT mutations', () => {
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
