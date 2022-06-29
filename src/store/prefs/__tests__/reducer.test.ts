import {fakePendingStoryFormat} from '../../../test-util';
import {StoryFormat} from '../../story-formats';
import {defaults} from '../defaults';
import {reducer} from '../reducer';

describe('Pref reducer', () => {
	const defs = defaults();

	describe('the init action', () => {
		it('replaces state', () =>
			expect(
				reducer(
					{...defs, donateShown: false},
					{
						type: 'init',
						state: {donateShown: true, locale: 'mock-locale'}
					}
				)
			).toEqual({
				...defs,
				donateShown: true,
				locale: 'mock-locale'
			}));
	});

	describe('the update action', () => {
		it('changes state', () =>
			expect(
				reducer(
					{...defs, donateShown: false},
					{type: 'update', name: 'locale', value: 'mock-locale'}
				)
			).toEqual({
				...defs,
				locale: 'mock-locale'
			}));
	});

	describe('the repair action', () => {
		let allFormats: StoryFormat[];

		beforeEach(() => {
			allFormats = [
				fakePendingStoryFormat({
					name: defs.proofingFormat.name,
					version: defs.proofingFormat.version
				}),
				fakePendingStoryFormat({
					name: defs.storyFormat.name,
					version: defs.storyFormat.version
				})
			];
			jest.spyOn(console, 'info').mockReturnValue();
		});

		it('leaves valid values alone', () =>
			expect(reducer({...defs}, {allFormats, type: 'repair'})).toEqual(defs));

		it('replaces undefined values', () =>
			expect(
				reducer({...defs, donateShown: undefined} as any, {
					allFormats,
					type: 'repair'
				})
			).toEqual(expect.objectContaining({donateShown: defs.donateShown})));

		it('replaces deleted values', () => {
			const badState: any = {...defs};

			delete badState.donateShown;
			expect(reducer(badState, {allFormats, type: 'repair'})).toEqual(
				expect.objectContaining({donateShown: defs.donateShown})
			);
		});

		it('replaces mistyped values', () =>
			expect(
				reducer({...defs, donateShown: 1} as any, {
					allFormats,
					type: 'repair'
				})
			).toEqual(expect.objectContaining({donateShown: defs.donateShown})));

		it.each([NaN, Infinity])('replaces a %d with a number', value => {
			const result = reducer({...defs, firstRunTime: value} as any, {
				allFormats,
				type: 'repair'
			});

			expect(Number.isFinite(result.firstRunTime)).toBe(true);
		});

		describe("if there isn't a format for the proofing format preference", () => {
			it('replaces it with the newest version available for that format name', () => {
				const result = reducer(
					{
						...defs,
						proofingFormat: {name: 'mock-format-name', version: '1.0.0'}
					},
					{
						allFormats: [
							fakePendingStoryFormat({
								name: 'mock-format-name',
								version: '1.0.1'
							})
						],
						type: 'repair'
					}
				);

				expect(result.proofingFormat).toEqual({
					name: 'mock-format-name',
					version: '1.0.1'
				});
			});

			it('resets to the default format if no versions exist', () => {
				const result = reducer(
					{
						...defs,
						proofingFormat: {name: 'mock-format-name', version: '1.0.0'}
					},
					{
						allFormats: [
							fakePendingStoryFormat({
								name: 'other-format-name',
								version: '2.0.0'
							})
						],
						type: 'repair'
					}
				);

				expect(result.proofingFormat).toEqual({
					name: defs.proofingFormat.name,
					version: defs.proofingFormat.version
				});
			});
		});

		describe("if there isn't a format for the story format preference", () => {
			it('replaces it with the newest version available for that format name', () => {
				const result = reducer(
					{
						...defs,
						storyFormat: {name: 'mock-format-name', version: '1.0.0'}
					},
					{
						allFormats: [
							fakePendingStoryFormat({
								name: 'mock-format-name',
								version: '1.0.1'
							})
						],
						type: 'repair'
					}
				);

				expect(result.storyFormat).toEqual({
					name: 'mock-format-name',
					version: '1.0.1'
				});
			});

			it('resets to the default format if no versions exist', () => {
				const result = reducer(
					{
						...defs,
						storyFormat: {name: 'mock-format-name', version: '1.0.0'}
					},
					{
						allFormats: [
							fakePendingStoryFormat({
								name: 'other-format-name',
								version: '2.0.0'
							})
						],
						type: 'repair'
					}
				);

				expect(result.storyFormat).toEqual({
					name: defs.storyFormat.name,
					version: defs.storyFormat.version
				});
			});
		});
	});
});
