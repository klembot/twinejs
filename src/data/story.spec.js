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

	it('updates a story with the UPDATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.UPDATE_STORY(state, state.stories[0].id, { color: 'red' });
		expect(state.stories[0].color).to.equal('red');
	});

	it('duplicates a story with the DUPLICATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		story.mutations.DUPLICATE_STORY(state, state.stories[0].id, 'Another Story');
		expect(state.stories).to.have.lengthOf(2);
		expect(state.stories[1].name).to.equal('Another Story');
		expect(state.stories[0].passages.length).to.equal(state.stories[1].passages.length);
		expect(state.stories[0].id).to.not.equal(state.stories[1].id);
		expect(state.stories[0].ifid).to.not.equal(state.stories[1].ifid);
		expect(state.stories[0].passages[0].id).to.not.equal(state.stories[1].passages[0].id);
		expect(state.stories[0].passages[0].story).to.equal(state.stories[0].id);
		expect(state.stories[1].passages[0].story).to.equal(state.stories[1].id);
	});

	it('throws an error if asked to DUPLICATE_STORY a nonexistent id', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(() => {
			story.mutations.DUPLICATE_STORY(state, 'nonexistent', 'Another Story')
		}).to.throw;
		expect(state.stories).to.have.lengthOf(1);
	});

	it('deletes a story with the DELETE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories).to.have.lengthOf(1);
		story.mutations.DELETE_STORY(state, state.stories[0].id);
		expect(state.stories).to.have.lengthOf(0);
	});

	it('throws an error if asked to DELETE_STORY a nonexistent id', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(() => {
			story.mutations.DELETE_STORY(state, 'nonexistent')
		}).to.throw;
		expect(state.stories).to.have.lengthOf(1);
	});

	it('imports stories with the IMPORT_STORY mutation', () => {
		const toImport = {
			startPassagePid: 100,
			name: 'An Imported Story',
			ifid: 'not-a-real-ifid',
			lastUpdate: new Date(),
			script: 'doSomeJavaScript()',
			stylesheet: 'body { color: red }',
			zoom: 1,
			passages: [
				{
					pid: 100,
					left: 10,
					top: 0,
					width: 50,
					height: 75,
					tags: ['red', 'green'],
					name: 'A Passage',
					text: 'Body text'
				}
			]
		};

		story.mutations.IMPORT_STORY(state, toImport);
		expect(state.stories).to.have.lengthOf(1);
		expect(state.stories[0].startPassageId).to.not.exist;
		expect(state.stories[0].id).to.be.a('string');
		expect(state.stories[0].name).to.equal('An Imported Story');
		expect(state.stories[0].ifid).to.be.a('string');
		expect(state.stories[0].lastUpdate).to.be.a('date');
		expect(state.stories[0].script).to.equal('doSomeJavaScript()');
		expect(state.stories[0].stylesheet).to.equal('body { color: red }');
		expect(state.stories[0].zoom).to.equal(1);
		expect(state.stories[0].passages).to.have.lengthOf(1);
		expect(state.stories[0].passages[0].id).to.be.a('string');
		expect(state.stories[0].passages[0].pid).to.not.exist;
		expect(state.stories[0].passages[0].left).to.equal(10);
		expect(state.stories[0].passages[0].top).to.equal(0);
		expect(state.stories[0].passages[0].width).to.equal(50);
		expect(state.stories[0].passages[0].height).to.equal(75);
		expect(state.stories[0].passages[0].name).to.equal('A Passage');
		expect(state.stories[0].passages[0].text).to.equal('Body text');
		expect(state.stories[0].passages[0].tags).to.have.lengthOf(2);
		expect(state.stories[0].passages[0].tags[0]).to.equal('red');
		expect(state.stories[0].passages[0].tags[1]).to.equal('green');
	});

	it('creates a passage with the CREATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			{
				name: 'A New Passage',
				text: 'Hello passage.'
			}
		);
		expect(state.stories[0].passages).to.have.lengthOf(1);
		expect(state.stories[0].passages[0].id).to.be.a('string');
		expect(state.stories[0].passages[0].name).to.equal('A New Passage');
		expect(state.stories[0].passages[0].text).to.equal('Hello passage.');
		expect(state.stories[0].passages[0].story).to.equal(state.stories[0].id);
	});

	it('creates unique IDs for passages with the CREATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			{
				name: 'A New Passage',
			}
		);
		story.mutations.CREATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			{
				name: 'Another Passage',
			}
		);
		expect(state.stories[0].passages).to.have.lengthOf(2);
		expect(state.stories[0].passages[0].id).to.not.equal(state.stories[0].passages[1].id);
	});

	it('updates passages with the UPDATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			{
				name: 'A New Passage',
			}
		);
		expect(state.stories[0].passages[0].name).to.equal('A New Passage');
		story.mutations.UPDATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			state.stories[0].passages[0].id,
			{
				name: 'A Different Name'
			}

		);
		expect(state.stories[0].passages[0].name).to.equal('A Different Name');
	});

	it('throws an error if UPDATE_PASSAGE_IN_STORY is passed a nonexistent story id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.UPDATE_PASSAGE_IN_STORY(state, 'nonexistent');
		}).to.throw;
	});

	it('throws an error if UPDATE_PASSAGE_IN_STORY is passed a nonexistent passage id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.UPDATE_PASSAGE_IN_STORY(
				state,
				state.stories[0].id,
				'nonexistent'
			);
		}).to.throw;
	});

	it('deletes passages with the DELETE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			{
				name: 'A New Passage',
			}
		);
		expect(state.stories[0].passages).to.have.lengthOf(1);
		story.mutations.DELETE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			state.stories[0].passages[0].id
		);
		expect(state.stories[0].passages).to.have.lengthOf(0);
	});

	it('throws an error if DELETE_PASSAGE_IN_STORY is passed a nonexistent story id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.DELETE_PASSAGE_IN_STORY(state, 'nonexistent');
		}).to.throw;
	});

	it('throws an error if UPDATE_PASSAGE_IN_STORY is passed a nonexistent passage id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.DELETE_PASSAGE_IN_STORY(
				state,
				state.stories[0].id,
				'nonexistent'
			);
		}).to.throw;
	});
});
