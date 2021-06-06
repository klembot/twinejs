import {unusedName} from '../unused-name';

describe('unusedName', () => {
	it('returns the name as-if if there are no conflicts', () => {
		expect(unusedName('a', [])).toBe('a');
		expect(unusedName('a', ['b'])).toBe('a');
	});

	it('returns the name with a number suffix if there are conflicts', () => {
		expect(unusedName('a', ['a'])).toBe('a 1');
		expect(unusedName('a', ['a', 'a 1'])).toBe('a 2');
	});
});
