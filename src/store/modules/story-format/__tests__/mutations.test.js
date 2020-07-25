import {formatDefaults} from '../defaults';
import * as mutations from '../mutations';

describe('story format data module Vuex mutations', () => {
	let testState;

	beforeEach(() => {
		testState = {formats: []};
	});

	describe('createFormat mutation', () => {
		it('creates a format', () => {
			const storyFormatProps = {name: 'Test Format'};

			mutations.createFormat(testState, {storyFormatProps});
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0]).toMatchObject(storyFormatProps);
			expect(testState.formats[0].loading).toBe(false);
			expect(testState.formats[0].properties).toBeNull();
		});

		it('forces formats to be unloaded and have null properties', () => {
			const storyFormatProps = {loaded: true, properties: {foo: true}};

			mutations.createFormat(testState, {storyFormatProps});
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0].loading).toBe(false);
			expect(testState.formats[0].properties).toBeNull();
		});

		it('assigns a UUID ID to formats', () => {
			mutations.createFormat(testState, {storyFormatProps: {}});
			expect(typeof testState.formats[0].id).toBe('string');
		});

		it('uses defaults where properties are not specified', () => {
			mutations.createFormat(testState, {storyFormatProps: {}});
			expect(testState.formats.length).toBe(1);
			expect(testState.formats[0]).toMatchObject(formatDefaults);
		});
	});

	it('updates a format with the updateFormat mutation', () => {
		mutations.createFormat(testState, {storyFormatProps: {id: 'abc'}});
		mutations.updateFormat(testState, {
			storyFormatId: testState.formats[0].id,
			storyFormatProps: {
				name: 'New Name'
			}
		});
		expect(testState.formats[0].name).toBe('New Name');
	});

	it('deletes a format with the deleteFormat mutation', () => {
		mutations.createFormat(testState, {storyFormatProps: {id: 'abc'}});
		mutations.deleteFormat(testState, {storyFormatId: testState.formats[0].id});
		expect(testState.formats.length).toBe(0);
	});
});
