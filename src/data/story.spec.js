const { expect } = require('chai');
const { spy } = require('sinon');
const story = require('./story');

describe('story data module', () => {
	const tinyStory = { name: 'Hello Story' };
	const bigStory = {
		id: 'not-a-real-id',
		name: 'Big Story',
		lastUpdate: new Date(Date.parse('January 1, 2001')),
		ifid: 'not-a-real-ifid',
		passages: [
			{
				name: 'A Passage',
				top: 10,
				left: 10,
				text: 'This is a passage.'
			}
		]
	};

	let state;

	beforeEach(() => {
		state = Object.assign({}, story.state);
		state.stories = [];
	});

	it('tracks an array of stories', () => {
		expect(story.state.stories).to.have.lengthOf(0);
	});

	it('adds a story with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories).to.have.lengthOf(1);
		expect(state.stories[0].name).to.equal('Hello Story');
	});

	it('assigns defaults to stories with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories[0].id).to.be.a('string');
		expect(state.stories[0].lastUpdate).to.be.a('date');
		expect(state.stories[0].ifid).to.be.a('string');
		expect(state.stories[0].passages).to.be.an('array');
		expect(state.stories[0].passages).to.have.lengthOf(0);
	});

	it('does not overwrite properties passed with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(state.stories[0].id).to.equal(bigStory.id);
		expect(state.stories[0].lastUpdate).to.equal(bigStory.lastUpdate);
		expect(state.stories[0].ifid).to.equal(bigStory.ifid);
		expect(state.stories[0].passages).to.have.lengthOf(1);
	});

	it('assigns a Treaty of Babel-compliant IFID with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories[0].ifid).to.match(/^[A-Z0-9-]+$/);
	});
});
