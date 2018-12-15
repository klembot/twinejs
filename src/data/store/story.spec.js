const {spy} = require('sinon');
const story = require('./story');

describe('story data module', () => {
	const tinyStory = {name: 'Hello Story'};
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

	test('tracks an array of stories', () => {
		expect(story.state.stories).toHaveLength(0);
	});

	test('adds a story with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories).toHaveLength(1);
		expect(state.stories[0].name).toBe('Hello Story');
	});

	test('assigns defaults to stories with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(typeof state.stories[0].id).toBe('string');
		expect(state.stories[0].lastUpdate instanceof Date).toBe(true);
		expect(typeof state.stories[0].ifid).toBe('string');
		expect(Array.isArray(state.stories[0].passages)).toBe(true);
		expect(state.stories[0].passages).toHaveLength(0);
	});

	test('does not overwrite properties passed with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(state.stories[0].id).toBe(bigStory.id);
		expect(state.stories[0].lastUpdate).toBe(bigStory.lastUpdate);
		expect(state.stories[0].ifid).toBe(bigStory.ifid);
		expect(state.stories[0].passages).toHaveLength(1);
	});

	test('assigns a Treaty of Babel-compliant IFID with the CREATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories[0].ifid).toMatch(/^[A-Z0-9-]+$/);
	});

	test('updates a story with the UPDATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.UPDATE_STORY(state, state.stories[0].id, {
			color: 'red'
		});
		expect(state.stories[0].color).toBe('red');
	});

	test('duplicates a story with the DUPLICATE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		story.mutations.DUPLICATE_STORY(
			state,
			state.stories[0].id,
			'Another Story'
		);
		expect(state.stories).toHaveLength(2);
		expect(state.stories[1].name).toBe('Another Story');
		expect(state.stories[0].passages.length).toBe(
			state.stories[1].passages.length
		);
		expect(state.stories[0].id).not.toBe(state.stories[1].id);
		expect(state.stories[0].ifid).not.toBe(state.stories[1].ifid);
		expect(state.stories[0].passages[0].id).not.toBe(
			state.stories[1].passages[0].id
		);
		expect(state.stories[0].passages[0].story).toBe(state.stories[0].id);
		expect(state.stories[1].passages[0].story).toBe(state.stories[1].id);
	});

	test('throws an error if asked to DUPLICATE_STORY a nonexistent id', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(() => {
			story.mutations.DUPLICATE_STORY(
				state,
				'nonexistent',
				'Another Story'
			);
		}).toThrow();
		expect(state.stories).toHaveLength(1);
	});

	test('deletes a story with the DELETE_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(state.stories).toHaveLength(1);
		story.mutations.DELETE_STORY(state, state.stories[0].id);
		expect(state.stories).toHaveLength(0);
	});

	test('does nothing if asked to DELETE_STORY a nonexistent id', () => {
		story.mutations.CREATE_STORY(state, bigStory);
		expect(() => {
			story.mutations.DELETE_STORY(state, 'nonexistent');
		}).not.toThrow();
		expect(state.stories).toHaveLength(1);
	});

	test('imports stories with the IMPORT_STORY mutation', () => {
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
		expect(state.stories).toHaveLength(1);
		expect(state.stories[0].startPassageId).toBeFalsy();
		expect(typeof state.stories[0].id).toBe('string');
		expect(state.stories[0].name).toBe('An Imported Story');
		expect(typeof state.stories[0].ifid).toBe('string');
		expect(state.stories[0].lastUpdate instanceof Date).toBe(true);
		expect(state.stories[0].script).toBe('doSomeJavaScript()');
		expect(state.stories[0].stylesheet).toBe('body { color: red }');
		expect(state.stories[0].zoom).toBe(1);
		expect(state.stories[0].passages).toHaveLength(1);
		expect(typeof state.stories[0].passages[0].id).toBe('string');
		expect(state.stories[0].passages[0].pid).toBeFalsy();
		expect(state.stories[0].passages[0].left).toBe(10);
		expect(state.stories[0].passages[0].top).toBe(0);
		expect(state.stories[0].passages[0].width).toBe(50);
		expect(state.stories[0].passages[0].height).toBe(75);
		expect(state.stories[0].passages[0].name).toBe('A Passage');
		expect(state.stories[0].passages[0].text).toBe('Body text');
		expect(state.stories[0].passages[0].tags).toHaveLength(2);
		expect(state.stories[0].passages[0].tags[0]).toBe('red');
		expect(state.stories[0].passages[0].tags[1]).toBe('green');
	});

	test('creates a passage with the CREATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(state, state.stories[0].id, {
			name: 'A New Passage',
			text: 'Hello passage.'
		});
		expect(state.stories[0].passages).toHaveLength(1);
		expect(typeof state.stories[0].passages[0].id).toBe('string');
		expect(state.stories[0].passages[0].name).toBe('A New Passage');
		expect(state.stories[0].passages[0].text).toBe('Hello passage.');
		expect(state.stories[0].passages[0].story).toBe(state.stories[0].id);
	});

	test('creates unique IDs for passages with the CREATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(state, state.stories[0].id, {
			name: 'A New Passage'
		});
		story.mutations.CREATE_PASSAGE_IN_STORY(state, state.stories[0].id, {
			name: 'Another Passage'
		});
		expect(state.stories[0].passages).toHaveLength(2);
		expect(state.stories[0].passages[0].id).not.toBe(
			state.stories[0].passages[1].id
		);
	});

	test('updates passages with the UPDATE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(state, state.stories[0].id, {
			name: 'A New Passage'
		});
		expect(state.stories[0].passages[0].name).toBe('A New Passage');
		story.mutations.UPDATE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			state.stories[0].passages[0].id,
			{name: 'A Different Name'}
		);
		expect(state.stories[0].passages[0].name).toBe('A Different Name');
	});

	test('does nothing if UPDATE_PASSAGE_IN_STORY is passed a nonexistent story id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.UPDATE_PASSAGE_IN_STORY(state, 'nonexistent');
		}).not.toThrow();
	});

	test('does nothing if UPDATE_PASSAGE_IN_STORY is passed a nonexistent passage id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.UPDATE_PASSAGE_IN_STORY(
				state,
				state.stories[0].id,
				'nonexistent',
				{}
			);
		}).not.toThrow();
	});

	test('deletes passages with the DELETE_PASSAGE_IN_STORY mutation', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		story.mutations.CREATE_PASSAGE_IN_STORY(state, state.stories[0].id, {
			name: 'A New Passage'
		});
		expect(state.stories[0].passages).toHaveLength(1);
		story.mutations.DELETE_PASSAGE_IN_STORY(
			state,
			state.stories[0].id,
			state.stories[0].passages[0].id
		);
		expect(state.stories[0].passages).toHaveLength(0);
	});

	test('throws an error if DELETE_PASSAGE_IN_STORY is passed a nonexistent story id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.DELETE_PASSAGE_IN_STORY(state, 'nonexistent');
		}).toThrow();
	});

	test('does nothing if UPDATE_PASSAGE_IN_STORY is passed a nonexistent passage id', () => {
		story.mutations.CREATE_STORY(state, tinyStory);
		expect(() => {
			story.mutations.DELETE_PASSAGE_IN_STORY(
				state,
				state.stories[0].id,
				'nonexistent'
			);
		}).not.toThrow();
	});
});
