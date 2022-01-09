import {reducer} from '../reducer';
import {builtins} from '../defaults';
import {StoryFormat} from '../story-formats.types';
import {fakeLoadedStoryFormat} from '../../../test-util';

describe('Story format reducer', () => {
	const builtinFormats = builtins().map(format => ({
		...format,
		loadState: 'unloaded',
		selected: false,
		userAdded: false
	}));
	let format: StoryFormat;
	let format2: StoryFormat;

	beforeEach(() => {
		jest.spyOn(console, 'info').mockReturnValue();
		format = fakeLoadedStoryFormat();
		format2 = fakeLoadedStoryFormat();
	});

	describe('the init action', () => {
		it('replaces state', () =>
			expect(reducer([], {type: 'init', state: [format, format2]})).toEqual([
				format,
				format2
			]));
	});

	describe('the create action', () => {
		it('adds a format', () =>
			expect(reducer([format], {type: 'create', props: format2})).toEqual([
				format,
				expect.objectContaining({
					...format2,
					id: expect.any(String),
					loadState: 'unloaded'
				})
			]));

		it('takes no action if the format already exists', () =>
			expect(reducer([format], {type: 'create', props: format})).toEqual([
				format
			]));
	});

	describe('the delete action', () => {
		it('removes a format', () =>
			expect(
				reducer([format, format2], {type: 'delete', id: format2.id})
			).toEqual([format]));

		it('takes no action if asked to delete a nonexistent format', () =>
			expect(reducer([format], {type: 'delete', id: format2.id})).toEqual([
				format
			]));
	});

	describe('the update action', () => {
		it('changes a format with the update action', () => {
			const result = reducer([format, format2], {
				type: 'update',
				id: format2.id,
				props: {name: 'mock-name'}
			});

			expect(result.find(f => f.id === format2.id)?.name).toBe('mock-name');
		});

		it('takes no action if the update would cause a name/version conflict', () =>
			expect(
				reducer([format, format2], {
					type: 'update',
					id: format.id,
					props: {name: format2.name, version: format2.version}
				})
			).toEqual([format, format2]));
	});

	describe('the repair action', () => {
		it('adds builtin formats not present', () =>
			expect(reducer([], {type: 'repair'})).toEqual(
				builtinFormats.map(format => ({...format, id: expect.any(String)}))
			));

		it('removes outdated builtin formats', () => {
			const outdatedFormat: StoryFormat = {
				...builtinFormats[0],
				id: 'mock-format-id',
				loadState: 'unloaded',
				version: '0.0.0'
			};

			expect(reducer([outdatedFormat], {type: 'repair'})).toEqual(
				builtinFormats.map(format => ({...format, id: expect.any(String)}))
			);
		});

		it('does not take any action on user-added formats', () => {
			const state = [format, format2];

			format.userAdded = true;
			format.version = '1.1.0';
			format2.userAdded = true;
			format2.name = format.name;
			format2.version = '1.0.0';

			const result = reducer(state, {type: 'repair'});

			expect(result.includes(format)).toBe(true);
			expect(result.includes(format2)).toBe(true);
		});
	});
});
