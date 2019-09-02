import {formatDefaults} from '../defaults';
import {state, mutations} from '..';

describe('Story format Vuex module', () => {
	let testState;

	beforeEach(() => {
		testState = {formats: []};
	});

	it('starts with an empty format list', () => {
		expect(state.formats.length).toBe(0);
	});

	describe('create mutation', () => {
		it('creates a format', () => {
			const testProps = {name: 'Test Format'};

			mutations.create(testState, testProps);
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0]).toMatchObject(testProps);
			expect(testState.formats[0].loaded).toBe(false);
			expect(testState.formats[0].properties).toMatchObject({});
		});

		it('forces formats to be unloaded and have empty properties', () => {
			mutations.create(testState, {loaded: true, properties: {foo: true}});
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0].loaded).toBe(false);
			expect(testState.formats[0].properties).toMatchObject({});
		});

		it('assigns a uuid to formats', () => {
			mutations.create(testState, {});
			expect(typeof testState.formats[0].id).toBe('string');
		});

		it('uses defaults where properties are not specified', () => {
			mutations.create(testState, {});
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0]).toMatchObject(formatDefaults);
		});
	});

	describe('setProperties mutation', () => {
		it('adds properties to a format', () => {
			mutations.create(testState, {id: 'abc'});
			mutations.setProperties(testState, testState.formats[0].id, {
				source: 'Hello!'
			});
			expect(testState.formats[0].properties.source).toBe('Hello!');
		});

		it("sets a format's loaded property", () => {
			mutations.create(testState, {id: 'abc'});
			mutations.setProperties(testState, testState.formats[0].id, {});
			expect(testState.formats[0].loaded).toBe(true);
		});

		it("calls a format's setup method bound to the format", () => {
			const setup = {call: jest.fn()};

			mutations.create(testState, {id: 'abc'});
			mutations.setProperties(testState, testState.formats[0].id, {setup});
			expect(setup.call).toHaveBeenCalledWith(testState.formats[0]);
		});
	});

	it('updates a format with the update mutation', () => {
		mutations.create(testState, {id: 'abc'});
		mutations.update(testState, testState.formats[0].id, {
			name: 'New Name'
		});
		expect(testState.formats[0].name).toBe('New Name');
	});

	it('deletes a format with the delete mutation', () => {
		mutations.create(testState, {id: 'abc'});
		mutations.delete(testState, testState.formats[0].id);
		expect(testState.formats.length).toBe(0);
	});
});
