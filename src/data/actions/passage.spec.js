const { expect } = require('chai');
const { spy } = require('sinon');
const actions = require('./passage');

describe('passage actions module', () => {
	const props = { fake: true };
	const fakeId = 'not-a-real-id';
	let store;

	beforeEach(() => {
		store = { dispatch: spy() };
	});

	it('dispatches a CREATE_PASSAGE_IN_STORY mutation with createPassage()', () => {
		actions.createPassage(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('CREATE_PASSAGE_IN_STORY', fakeId, props)).to.be.true;
	});

	it('dispatches an UPDATE_PASSAGE_IN_STORY mutation with updatePassage()', () => {
		actions.updatePassage(store, fakeId, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PASSAGE_IN_STORY', fakeId, fakeId, props)).to.be.true;
	});

	it('dispatches a DELETE_PASSAGE_IN_STORY mutation with deletePassage()', () => {
		actions.deletePassage(store, fakeId, fakeId);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('DELETE_PASSAGE_IN_STORY', fakeId, fakeId)).to.be.true;
	});

	it('requires a numeric grid size, if passed, when positioning passages()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: 'a',
									left: 10,
									top: 10
								}
							]
						}
					]
				}
			}
		};

		/* Test non-numeric argument. */

		expect(() =>
			actions.positionPassage(storyStore, fakeId, fakeId, 'a')
		).to.throw();

		/* Test undefined argument. */

		actions.positionPassage(storyStore, fakeId, fakeId);
		expect(storyStore.state.story.stories[0].passages[0].left).to.equal(10);
		expect(storyStore.state.story.stories[0].passages[0].top).to.equal(10);

		/* Test null argument. */

		actions.positionPassage(storyStore, fakeId, fakeId, null);
		expect(storyStore.state.story.stories[0].passages[0].left).to.equal(10);
		expect(storyStore.state.story.stories[0].passages[0].top).to.equal(10);
	});

	it('creates new links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '', 10);
		expect(storyStore.dispatch.calledOnce).to.be.true;

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).to.equal('CREATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2].name).to.equal('Test 2');
	});

	it('skips old links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '[[Test 2]]');
		expect(storyStore.dispatch.called).to.be.false;
	});

	it('updates links with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, 'Test 2', 'Test 2 Changed');

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2]).to.equal(fakeId);
		expect(firstCall.args[3].text).to.equal('[[Test 2 Changed]]');
	});

	it('handles regular expression characters with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[.]]'
								},
								{
									id: fakeId + '2',
									name: 'Test 2',
									text: '[[2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, '.', 'Changed');
		actions.changeLinksInStory(storyStore, fakeId, '2', '$');

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2]).to.equal(fakeId);
		expect(firstCall.args[3].text).to.equal('[[Changed]]');

		const secondCall = storyStore.dispatch.getCall(1);

		expect(secondCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(secondCall.args[1]).to.equal(fakeId);
		expect(secondCall.args[2]).to.equal(fakeId + '2');
		expect(secondCall.args[3].text).to.equal('[[$]]');
	});
});
