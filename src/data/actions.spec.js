const { expect } = require('chai');
const { spy } = require('sinon');
const actions = require('./actions');

describe('actions data module', () => {
	const props = { fake: true };
	const fakeId = fakeId;
	let store;
	
	beforeEach(() => {
		store = { dispatch : spy() };
	});
	
	it('dispatches an UPDATE_PREF mutation with setPref()', () => {
		actions.setPref(store, 'key', 42);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('UPDATE_PREF', 'key', 42)).to.equal.true;
	});
	
	it('dispatches a CREATE_STORY mutation with createStory()', () => {
		actions.createStory(store, 'A New Story');
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('CREATE_STORY', 'A New Story')).to.equal.true;
	});

	it('dispatches a DELETE_STORY mutation with deleteStory()', () => {
		actions.deleteStory(store, fakeId);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('DELETE_STORY', fakeId)).to.equal.true;
	});
	
	it('dispatches a DUPLICATE_STORY mutation with deleteStory()', () => {
		actions.duplicateStory(store, fakeId, 'Another Name');
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('DUPLICATE_STORY', fakeId, 'Another Name')).to.equal.true;
	});
	
	it('dispatches an IMPORT_STORY mutation with importStory()', () => {		
		actions.importStory(store, props);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('IMPORT_STORY', props)).to.equal.true;
	});
	
	it('dispatches an UPDATE_STORY mutation with updateStory()', () => {				
		actions.updateStory(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('UPDATE_STORY', props)).to.equal.true;
	});
	
	it('dispatches a CREATE_PASSAGE_IN_STORY mutation with createPassageInStory()', () => {				
		actions.createPassageInStory(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('UPDATE_STORY', props)).to.equal.true;
	});	
	
	it('dispatches an UPDATE_PASSAGE_IN_STORY mutation with createPassageInStory()', () => {				
		actions.updatePassageInStory(store, fakeId, fakeId, props);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('UPDATE_PASSAGE_IN_STORY', fakeId, fakeId, props)).to.equal.true;
	});
	
	it('dispatches a DELETE_PASSAGE_IN_STORY mutation with deletePassageInStory()', () => {				
		actions.deletePassageInStory(store, fakeId, fakeId);
		expect(store.dispatch.calledOnce).to.equal.true;
		expect(store.dispatch.calledWith('DELETE_PASSAGE_IN_STORY', fakeId, fakeId)).to.equal.true;
	});	
});