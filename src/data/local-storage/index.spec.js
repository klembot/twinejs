describe('local-storage persistence', () => {
	const {spy, stub} = require('sinon');
	const localStorage = require('./index');
	let pref = require('./pref');
	let mutationObserver;
	let story = require('./story');
	let storyFormat = require('./story-format');
	let store;

	/* Mimic the Vuex subscribe() flow. */

	function dispatchMutation(mutation) {
		mutationObserver(mutation, store.state);
	}

	beforeEach(() => {
		store = {
			dispatch: spy(),
			subscribe: function(callback) {
				mutationObserver = callback;
			},
			state: {
				pref: {},
				story: {stories: []},
				storyFormat: {formats: []}
			}
		};

		stub(pref, 'load');
		stub(pref, 'save');
		stub(story, 'load');
		stub(story, 'deletePassage');
		stub(story, 'deletePassageById');
		stub(story, 'deleteStory');
		stub(story, 'savePassage');
		stub(story, 'saveStory');
		stub(storyFormat, 'load');
		stub(storyFormat, 'save');
	});

	afterEach(() => {
		pref.load.restore();
		pref.save.restore();
		story.load.restore();
		story.deletePassage.restore();
		story.deletePassageById.restore();
		story.deleteStory.restore();
		story.savePassage.restore();
		story.saveStory.restore();
		storyFormat.load.restore();
		storyFormat.save.restore();
	});

	test('loads the pref, story, and story-format modules when starting', () => {
		localStorage(store);
		expect(pref.load.calledOnce).toBe(true);
		expect(story.load.calledOnce).toBe(true);
		expect(storyFormat.load.calledOnce).toBe(true);
	});

	test('calls story.saveStory() when a CREATE_STORY mutation occurs', () => {
		dispatchMutation({
			type: 'CREATE_STORY',
			payload: [{name: 'A Story'}]
		});
		expect(story.saveStory.calledOnce).toBe(true);
	});

	test('calls story.saveStory() when an UPDATE_STORY mutation occurs', () => {
		dispatchMutation({
			type: 'UPDATE_STORY',
			payload: ['not-an-id']
		});
		expect(story.saveStory.calledOnce).toBe(true);
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
		expect(story.saveStory.calledOnce).toBe(true);
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
		expect(story.saveStory.calledOnce).toBe(true);
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
		expect(story.deleteStory.calledOnce).toBe(true);
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

		expect(story.saveStory.calledOnce).toBe(true);
		expect(story.savePassage.calledOnce).toBe(true);
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

		expect(story.saveStory.calledOnce).toBe(true);
		expect(story.savePassage.calledOnce).toBe(true);
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

		expect(story.saveStory.calledOnce).toBe(true);

		const deleteByObject = story.deletePassage.calledOnce;
		const deleteById = story.deletePassageById.calledOnce;

		expect(
			(deleteByObject && !deleteById) || (!deleteByObject && deleteById)
		).toBe(true);
	});

	test('calls pref.save() when an UPDATE_PREF mutation occurs', () => {
		dispatchMutation({type: 'UPDATE_PREF'});
		expect(pref.save.calledOnce).toBe(true);
	});

	test('calls storyFormat.save() when a CREATE_FORMAT mutation occurs', () => {
		dispatchMutation({type: 'CREATE_FORMAT'});
		expect(storyFormat.save.calledOnce).toBe(true);
	});

	test('calls storyFormat.save() when an UPDATE_FORMAT mutation occurs', () => {
		dispatchMutation({type: 'UPDATE_FORMAT'});
		expect(storyFormat.save.calledOnce).toBe(true);
	});

	test('calls storyFormat.save() when a DELETE_FORMAT mutation occurs', () => {
		dispatchMutation({type: 'DELETE_FORMAT'});
		expect(storyFormat.save.calledOnce).toBe(true);
	});

	test('ignores LOAD_FORMAT mutations', () => {
		dispatchMutation({type: 'LOAD_FORMAT'});
		expect(storyFormat.save.calledOnce).toBe(false);
	});

	test('throws an error when given a mutation it does not know how to handle', () => {
		expect(() => {
			dispatchMutation({type: '???'});
		}).toThrow();
	});
});
