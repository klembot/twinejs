import {defaults} from '../defaults';
import {reducer} from '../reducer';

describe('Pref reducer', () => {
	const defs = defaults();

	it('replaces state with the init action', () =>
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

	it('changes state with the update action', () =>
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
