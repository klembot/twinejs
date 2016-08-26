describe('local-storage persistence', () => {
	const { expect } = require('chai');
	const { spy, stub } = require('sinon');
	const localStorage = require('./index');
	let pref = require('./pref');
	let story = require('./story');
	let storyFormat = require('./story-format');
	let store;

	beforeEach(() => {		
		store = {
			dispatch: spy(),
			state: {
				pref: {},
				story: { stories: [] },
				storyFormat: { formats: [] }
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
		
	it('loads the pref, story, and story-format modules when starting', () => {	
		localStorage.onInit(store.state, store);
		expect(pref.load.calledOnce).to.be.true;
		expect(story.load.calledOnce).to.be.true;
		expect(storyFormat.load.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() when a CREATE_STORY mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'CREATE_STORY',
				payload: [{
					name: 'A Story'
				}]
			},
			store.state,
			store
		);
		expect(story.saveStory.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() when an UPDATE_STORY mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'UPDATE_STORY',
				payload: ['not-an-id']
			},
			store.state,
			store
		);
		expect(story.saveStory.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() when a DUPLICATE_STORY mutation occurs', () => {
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
		
		localStorage.onMutation(
			{
				type: 'DUPLICATE_STORY',
				payload: ['not-an-id', 'Copied Story']
			},
			store.state,
			store
		);
		expect(story.saveStory.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() when an IMPORT_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: []
		});
		
		localStorage.onMutation(
			{
				type: 'IMPORT_STORY',
				payload: [{
					name: 'Imported Story'
				}]
			},
			store.state,
			store
		);
		expect(story.saveStory.calledOnce).to.be.true;
	});
	
	it('calls story.deleteStory() when an DELETE_STORY mutation occurs', () => {
		store.state.story.stories.push({
			id: 'not-an-id',
			name: 'Imported Story',
			passages: []
		});
		
		localStorage.onMutation(
			{
				type: 'DELETE_STORY',
				payload: ['not-an-id']
			},
			store.state,
			store
		);
		expect(story.deleteStory.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() and story.savePassage() when a CREATE_PASSAGE_IN_STORY mutation occurs', () => {
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
		
		localStorage.onMutation(
			{
				type: 'CREATE_PASSAGE_IN_STORY',
				payload: [
					'not-an-id',
					{
						name: 'A Passage'
					}
				]
			},
			store.state,
			store
		);

		expect(story.saveStory.calledOnce).to.be.true;
		expect(story.savePassage.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() and story.savePassage() when an UPDATE_PASSAGE_IN_STORY mutation occurs', () => {
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
		
		localStorage.onMutation(
			{
				type: 'CREATE_PASSAGE_IN_STORY',
				payload: [
					'not-an-id',
					{
						name: 'A Passage'
					}
				]
			},
			store.state,
			store
		);

		expect(story.saveStory.calledOnce).to.be.true;
		expect(story.savePassage.calledOnce).to.be.true;
	});
	
	it('calls story.saveStory() and story.deletePassage()/deletePassageById() when an DELETE_PASSAGE_IN_STORY mutation occurs', () => {
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
		
		localStorage.onMutation(
			{
				type: 'DELETE_PASSAGE_IN_STORY',
				payload: [
					'not-an-id',
					{
						name: 'A Passage'
					}
				]
			},
			store.state,
			store
		);

		expect(story.saveStory.calledOnce).to.be.true;
		
		const deleteByObject = story.deletePassage.calledOnce;
		const deleteById = story.deletePassageById.calledOnce;
		
		expect((deleteByObject && !deleteById) ||
			(!deleteByObject && deleteById)).to.be.true;
	});
	
	it('calls pref.save() when an UPDATE_PREF mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'UPDATE_PREF'
			},
			store.state,
			store
		);
		
		expect(pref.save.calledOnce).to.be.true;
	});
	
	it('calls storyFormat.save() when a CREATE_FORMAT mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'CREATE_FORMAT'
			},
			store.state,
			store
		);
		
		expect(storyFormat.save.calledOnce).to.be.true;
	});
	
	it('calls storyFormat.save() when an UPDATE_FORMAT mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'UPDATE_FORMAT'
			},
			store.state,
			store
		);
		
		expect(storyFormat.save.calledOnce).to.be.true;
	});
	
	it('calls storyFormat.save() when a DELETE_FORMAT mutation occurs', () => {
		localStorage.onMutation(
			{
				type: 'DELETE_FORMAT'
			},
			store.state,
			store
		);
		
		expect(storyFormat.save.calledOnce).to.be.true;
	});
	
	it('ignores LOAD_FORMAT mutations', () => {
		localStorage.onMutation(
			{
				type: 'LOAD_FORMAT'
			},
			store.state,
			store	
		);
		
		expect(storyFormat.save.calledOnce).to.be.false;		
	});
	
	it('throws an error when given a mutation it does not know how to handle', () => {
		expect(() => { localStorage.onMutation({ type: '???' }) }).to.throw;
	});
});
