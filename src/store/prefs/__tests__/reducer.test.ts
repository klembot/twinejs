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
		beforeEach(() => jest.spyOn(console, 'info').mockReturnValue());

		it('leaves valid values alone', () =>
			expect(reducer({...defs}, {type: 'repair'})).toEqual(defs));

		it('replaces undefined values', () =>
			expect(
				reducer({...defs, donateShown: undefined} as any, {type: 'repair'})
			).toEqual(expect.objectContaining({donateShown: defs.donateShown})));

		it('replaces deleted values', () => {
			const badState: any = {...defs};

			delete badState.donateShown;
			expect(reducer(badState, {type: 'repair'})).toEqual(
				expect.objectContaining({donateShown: defs.donateShown})
			);
		});

		it('replaces mistyped values', () =>
			expect(
				reducer({...defs, donateShown: 1} as any, {type: 'repair'})
			).toEqual(expect.objectContaining({donateShown: defs.donateShown})));

		it.each([NaN, Infinity])('replaces a %d with a number', value => {
			const result = reducer({...defs, firstRunTime: value} as any, {
				type: 'repair'
			});

			expect(Number.isFinite(result.firstRunTime)).toBe(true);
		});
	});
});
