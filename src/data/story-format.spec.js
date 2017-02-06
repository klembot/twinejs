const { expect } = require('chai');
const { spy } = require('sinon');
const storyFormat = require('./story-format');

describe('story-format data module', () => {
	const props = { name: 'Test Format', version: '1.0.0' };
	let state;

	beforeEach(() => {
		state = Object.assign({}, storyFormat.state);
		state.formats = [];
	});

	it('tracks an array of formats', () => {
		expect(storyFormat.state.formats).to.have.lengthOf(0);
	});

	it('adds a format with the CREATE_FORMAT mutation', () => {
		expect(state.formats).to.have.lengthOf(0);
		storyFormat.mutations.CREATE_FORMAT(state, props);
		expect(state.formats).to.have.lengthOf(1);
		expect(state.formats[0].name).to.equal('Test Format');
		expect(state.formats[0].version).to.equal('1.0.0');
	});

	it('assigns a uuid to formats with the CREATE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		expect(state.formats[0].id).to.be.a('string');
	});

	it('sets a loaded property on formats with the CREATE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		expect(state.formats[0].loaded).to.be.false;
	});

	it('adds properties to a format with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{ source: 'Hello!' }
		);

		expect(state.formats[0].properties.source).to.equal('Hello!');
	});

	it('sets a format\'s loaded property with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{}
		);

		expect(state.formats[0].loaded).to.be.true;
	});

	it('sets a format\'s loaded property with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{}
		);

		expect(state.formats[0].loaded).to.be.true;
	});

	it('calls a format\'s setup method bound to the format during the LOAD_FORMAT mutation', () => {
		let setup = spy();

		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{ setup }
		);

		expect(setup.called).to.be.true;
		expect(setup.calledOn(state.formats[0])).to.be.true;
	});

	it('updates a format with the UPDATE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.UPDATE_FORMAT(
			state,
			state.formats[0].id,
			{ name: 'New Name' }
		);

		expect(state.formats[0].name).to.equal('New Name');
	});

	it('deletes a format with the DELETE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.DELETE_FORMAT(
			state,
			state.formats[0].id
		);

		expect(state.formats.length).to.equal(0);
	});
});
