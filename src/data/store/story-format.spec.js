const { spy } = require('sinon');
const storyFormat = require('./story-format');

describe('story-format data module', () => {
	const props = { name: 'Test Format', version: '1.0.0' };
	let state;

	beforeEach(() => {
		state = Object.assign({}, storyFormat.state);
		state.formats = [];
	});

	test('tracks an array of formats', () => {
		expect(storyFormat.state.formats).toHaveLength(0);
	});

	test('adds a format with the CREATE_FORMAT mutation', () => {
		expect(state.formats).toHaveLength(0);
		storyFormat.mutations.CREATE_FORMAT(state, props);
		expect(state.formats).toHaveLength(1);
		expect(state.formats[0].name).toBe('Test Format');
		expect(state.formats[0].version).toBe('1.0.0');
	});

	test('assigns a uuid to formats with the CREATE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		expect(typeof state.formats[0].id).toBe('string');
	});

	test(
        'sets a loaded property on formats with the CREATE_FORMAT mutation',
        () => {
            storyFormat.mutations.CREATE_FORMAT(state, props);
            expect(state.formats[0].loaded).toBe(false);
        }
    );

	test('adds properties to a format with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{ source: 'Hello!' }
		);

		expect(state.formats[0].properties.source).toBe('Hello!');
	});

	test('sets a format\'s loaded property with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{}
		);

		expect(state.formats[0].loaded).toBe(true);
	});

	test('sets a format\'s loaded property with the LOAD_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.LOAD_FORMAT(
			state,
			state.formats[0].id,
			{}
		);

		expect(state.formats[0].loaded).toBe(true);
	});

	test(
        'calls a format\'s setup method bound to the format during the LOAD_FORMAT mutation',
        () => {
            let setup = spy();

            storyFormat.mutations.CREATE_FORMAT(state, props);
            storyFormat.mutations.LOAD_FORMAT(
                state,
                state.formats[0].id,
                { setup }
            );

            expect(setup.called).toBe(true);
            expect(setup.calledOn(state.formats[0])).toBe(true);
        }
    );

	test('updates a format with the UPDATE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.UPDATE_FORMAT(
			state,
			state.formats[0].id,
			{ name: 'New Name' }
		);

		expect(state.formats[0].name).toBe('New Name');
	});

	test('deletes a format with the DELETE_FORMAT mutation', () => {
		storyFormat.mutations.CREATE_FORMAT(state, props);
		storyFormat.mutations.DELETE_FORMAT(
			state,
			state.formats[0].id
		);

		expect(state.formats.length).toBe(0);
	});
});
